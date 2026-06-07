import { useCallback, useEffect, useMemo, useState } from 'react';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useGamificacao } from '../context/GamificacaoContext';
import {
  STATUS_LEITURA,
  atualizarFavoritoBiblioteca,
  atualizarStatusBiblioteca,
  listarBiblioteca,
  removerDaBiblioteca,
} from '../services/biblioteca';
import '../styles/pages/Biblioteca.css';

const FILTERS = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Quero ler', value: 'QUERO_LER' },
  { label: 'Lendo', value: 'LENDO' },
  { label: 'Lido', value: 'LIDO' },
  { label: 'Abandonado', value: 'ABANDONADO' },
  { label: 'Favoritos', value: 'FAVORITOS' },
];

function Biblioteca() {
  const { token, user } = useAuth();
  const { ganharXP, registrarStats } = useGamificacao();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const syncStats = useCallback(
    (currentItems) => {
      registrarStats({
        totalLivros: currentItems.length,
        livrosLidos: currentItems.filter((item) => item.statusLeitura === 'LIDO').length,
        favoritos: currentItems.filter((item) => item.favorito).length,
        abandonados: currentItems.filter((item) => item.statusLeitura === 'ABANDONADO').length,
        queroLer: currentItems.filter((item) => item.statusLeitura === 'QUERO_LER').length,
        lendo: currentItems.filter((item) => item.statusLeitura === 'LENDO').length,
      });
    },
    [registrarStats]
  );

  useEffect(() => {
    let cancelled = false;

    const loadLibrary = async () => {
      if (!user?.id) {
        setLoading(false);
        setError('Não foi possível identificar o usuário autenticado.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await listarBiblioteca(token);
        if (!cancelled) {
          const lista = response || [];
          setItems(lista);
          syncStats(lista);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Não foi possível carregar sua biblioteca.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLibrary();

    return () => {
      cancelled = true;
    };
  }, [syncStats, token, user?.id]);

  const filteredItems = useMemo(() => {
    if (filter === 'TODOS') {
      return items;
    }

    if (filter === 'FAVORITOS') {
      return items.filter((item) => item.favorito);
    }

    return items.filter((item) => item.statusLeitura === filter);
  }, [filter, items]);

  const counters = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.total += 1;
        acc[item.statusLeitura] = (acc[item.statusLeitura] || 0) + 1;
        if (item.favorito) {
          acc.favoritos += 1;
        }
        return acc;
      },
      { total: 0, favoritos: 0 }
    );
  }, [items]);

  const handleStatusChange = async (item, statusLeitura) => {
    setUpdatingId(item.id);
    setError('');
    setSuccessMessage('');

    try {
      const updated = await atualizarStatusBiblioteca(item.id, statusLeitura, token);
      const novaLista = items.map((entry) => (entry.id === item.id ? updated : entry));
      setItems(novaLista);
      setSuccessMessage('Status atualizado.');

      if (statusLeitura === 'LIDO') {
        ganharXP('MARCAR_LIDO');
      } else if (statusLeitura === 'LENDO') {
        ganharXP('MARCAR_LENDO');
      }

      syncStats(novaLista);
    } catch (err) {
      setError(err.message || 'Não foi possível atualizar o status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFavorite = async (item) => {
    setUpdatingId(item.id);
    setError('');
    setSuccessMessage('');

    try {
      const updated = await atualizarFavoritoBiblioteca(item.id, !item.favorito, token);
      const novaLista = items.map((entry) => (entry.id === item.id ? updated : entry));
      setItems(novaLista);
      setSuccessMessage(updated.favorito ? 'Livro favoritado.' : 'Livro removido dos favoritos.');

      if (updated.favorito) {
        ganharXP('FAVORITAR_LIVRO');
      }

      syncStats(novaLista);
    } catch (err) {
      setError(err.message || 'Não foi possível atualizar o favorito.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (item) => {
    const title = item.livro?.titulo || 'este livro';
    const confirmed = window.confirm(`Remover "${title}" da sua biblioteca?`);

    if (!confirmed) {
      return;
    }

    setUpdatingId(item.id);
    setError('');
    setSuccessMessage('');

    try {
      await removerDaBiblioteca(item.id, token);
      const novaLista = items.filter((entry) => entry.id !== item.id);
      setItems(novaLista);
      syncStats(novaLista);
      setSuccessMessage('Livro removido da biblioteca.');
    } catch (err) {
      setError(err.message || 'Não foi possível remover o livro da biblioteca.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="biblioteca">
      <header className="biblioteca__header">
        <div>
          <p className="biblioteca__eyebrow">Biblioteca</p>
          <h1>Sua estante de leitura</h1>
          <p>
            Organize livros salvos, acompanhe status e marque favoritos em uma
            visão única.
          </p>
        </div>

        <div className="biblioteca__stats">
          <article>
            <strong>{counters.total}</strong>
            <span>Total</span>
          </article>
          <article>
            <strong>{counters.LENDO || 0}</strong>
            <span>Lendo</span>
          </article>
          <article>
            <strong>{counters.favoritos}</strong>
            <span>Favoritos</span>
          </article>
        </div>
      </header>

      {error && <AlertMessage type="error" title="Falha" message={error} />}
      {successMessage && <AlertMessage type="success" title="Tudo certo" message={successMessage} />}

      <div className="biblioteca__filters">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`biblioteca__filter${filter === option.value ? ' biblioteca__filter--active' : ''}`}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <section className="biblioteca__empty">
          <h2>Carregando biblioteca...</h2>
          <p>Aguarde enquanto buscamos seus livros salvos.</p>
        </section>
      ) : filteredItems.length === 0 ? (
        <section className="biblioteca__empty">
          <h2>Nenhum livro neste filtro</h2>
          <p>Adicione livros pela tela Explorar para preencher sua biblioteca.</p>
        </section>
      ) : (
        <section className="biblioteca__grid">
          {filteredItems.map((item) => (
            <article key={item.id} className="biblioteca__card">
              <img src={item.livro.capa} alt={item.livro.titulo} />
              <div className="biblioteca__card-body">
                <span>{item.livro.categoria || 'Livro'}</span>
                <h2>{item.livro.titulo}</h2>
                <p className="biblioteca__author">{item.livro.autor}</p>
                <p className="biblioteca__description">{item.livro.descricao}</p>

                <label htmlFor={`status-${item.id}`}>Status</label>
                <select
                  id={`status-${item.id}`}
                  value={item.statusLeitura}
                  onChange={(event) => handleStatusChange(item, event.target.value)}
                  disabled={updatingId === item.id}
                >
                  {Object.entries(STATUS_LEITURA).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>

                <div className="biblioteca__actions">
                  <Button
                    variant={item.favorito ? 'primary' : 'secondary'}
                    onClick={() => handleFavorite(item)}
                    disabled={updatingId === item.id}
                  >
                    {item.favorito ? 'Favorito' : 'Favoritar'}
                  </Button>
                  <button
                    className="biblioteca__remove-btn"
                    type="button"
                    onClick={() => handleRemove(item)}
                    disabled={updatingId === item.id}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default Biblioteca;
