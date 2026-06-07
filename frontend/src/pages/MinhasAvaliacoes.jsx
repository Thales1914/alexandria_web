import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import {
  atualizarAvaliacao,
  excluirAvaliacao,
  listarMinhasAvaliacoes,
} from '../services/avaliacoes';
import '../styles/pages/MinhasAvaliacoes.css';

const RATINGS = [1, 2, 3, 4, 5];

function formatDate(value) {
  if (!value) {
    return 'Data não informada';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function escapeCsv(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadTextFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function toCsv(avaliacoes) {
  const header = ['Título', 'Autor', 'Nota', 'Resenha', 'Data'];
  const rows = avaliacoes.map((avaliacao) => [
    avaliacao.livro?.titulo || '',
    avaliacao.livro?.autor || '',
    avaliacao.nota,
    avaliacao.resenha || '',
    formatDate(avaliacao.dataAvaliacao),
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
}

function MinhasAvaliacoes() {
  const { token } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState({ nota: 5, resenha: '' });
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadAvaliacoes = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await listarMinhasAvaliacoes(token);
        if (!cancelled) {
          setAvaliacoes(response || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Não foi possível carregar suas avaliações.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAvaliacoes();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const stats = useMemo(() => {
    const total = avaliacoes.length;
    const soma = avaliacoes.reduce((acc, avaliacao) => acc + Number(avaliacao.nota || 0), 0);
    const comResenha = avaliacoes.filter((avaliacao) => avaliacao.resenha?.trim()).length;

    return {
      total,
      media: total ? (soma / total).toFixed(1) : '0.0',
      comResenha,
    };
  }, [avaliacoes]);

  const startEdit = (avaliacao) => {
    setEditingId(avaliacao.id);
    setEditDraft({
      nota: avaliacao.nota || 5,
      resenha: avaliacao.resenha || '',
    });
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({ nota: 5, resenha: '' });
  };

  const handleUpdate = async (avaliacaoId) => {
    setSavingId(avaliacaoId);
    setError('');
    setSuccess('');

    try {
      const updated = await atualizarAvaliacao(
        avaliacaoId,
        { nota: Number(editDraft.nota), resenha: editDraft.resenha },
        token
      );
      setAvaliacoes((current) =>
        current.map((avaliacao) => (avaliacao.id === avaliacaoId ? updated : avaliacao))
      );
      setSuccess('Avaliação atualizada.');
      cancelEdit();
    } catch (err) {
      setError(err.message || 'Não foi possível atualizar a avaliação.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (avaliacao) => {
    const title = avaliacao.livro?.titulo || 'este livro';
    const confirmed = window.confirm(`Excluir sua avaliação de "${title}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(avaliacao.id);
    setError('');
    setSuccess('');

    try {
      await excluirAvaliacao(avaliacao.id, token);
      setAvaliacoes((current) => current.filter((item) => item.id !== avaliacao.id));
      setSuccess('Avaliação excluída.');
    } catch (err) {
      setError(err.message || 'Não foi possível excluir a avaliação.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCsv = () => {
    downloadTextFile('minhas-avaliacoes.csv', toCsv(avaliacoes), 'text/csv;charset=utf-8');
  };

  return (
    <div className="minhas-avaliacoes">
      <header className="minhas-avaliacoes__header">
        <div>
          <p className="minhas-avaliacoes__eyebrow">Minhas avaliações</p>
          <h1>Notas e resenhas da sua estante</h1>
          <p>
            Revise o que você avaliou, ajuste notas, edite resenhas e mantenha
            um registro exportável das suas leituras.
          </p>
        </div>

        <div className="minhas-avaliacoes__actions" aria-label="Exportar avaliações">
          <Button variant="secondary" onClick={handleExportCsv} disabled={!avaliacoes.length}>
            Exportar CSV
          </Button>
        </div>
      </header>

      <section className="minhas-avaliacoes__stats" aria-label="Resumo das avaliações">
        <article>
          <strong>{stats.total}</strong>
          <span>Total</span>
        </article>
        <article>
          <strong>{stats.media}</strong>
          <span>Média</span>
        </article>
        <article>
          <strong>{stats.comResenha}</strong>
          <span>Com resenha</span>
        </article>
      </section>

      {error && <AlertMessage type="error" title="Falha" message={error} />}
      {success && <AlertMessage type="success" title="Tudo certo" message={success} />}

      {loading ? (
        <section className="minhas-avaliacoes__empty">
          <h2>Carregando avaliações...</h2>
          <p>Aguarde enquanto buscamos suas notas e resenhas.</p>
        </section>
      ) : avaliacoes.length === 0 ? (
        <section className="minhas-avaliacoes__empty">
          <h2>Você ainda não avaliou nenhum livro</h2>
          <p>Abra um livro em Explorar, escolha uma nota e escreva sua primeira resenha.</p>
          <Link className="minhas-avaliacoes__empty-link" to="/explorar">
            Encontrar livros
          </Link>
        </section>
      ) : (
        <section className="minhas-avaliacoes__list">
          {avaliacoes.map((avaliacao) => {
            const livro = avaliacao.livro || {};
            const isEditing = editingId === avaliacao.id;

            return (
              <article key={avaliacao.id} className="minhas-avaliacoes__item">
                <img
                  src={livro.capa || 'https://placehold.co/180x260/112240/64ffda?text=Sem+Capa'}
                  alt={livro.titulo || 'Livro avaliado'}
                />

                <div className="minhas-avaliacoes__content">
                  <div className="minhas-avaliacoes__item-header">
                    <div>
                      <span>{livro.categoria || 'Livro'}</span>
                      <h2>{livro.titulo || 'Título indisponível'}</h2>
                      <p>{livro.autor || 'Autor desconhecido'}</p>
                    </div>
                    <time dateTime={avaliacao.dataAvaliacao}>
                      {formatDate(avaliacao.dataAvaliacao)}
                    </time>
                  </div>

                  {isEditing ? (
                    <div className="minhas-avaliacoes__edit">
                      <fieldset>
                        <legend>Nota</legend>
                        <div className="minhas-avaliacoes__rating-options">
                          {RATINGS.map((value) => (
                            <button
                              key={value}
                              type="button"
                              className={`minhas-avaliacoes__rating-btn${
                                Number(editDraft.nota) === value
                                  ? ' minhas-avaliacoes__rating-btn--active'
                                  : ''
                              }`}
                              onClick={() => setEditDraft((current) => ({ ...current, nota: value }))}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </fieldset>

                      <label htmlFor={`resenha-${avaliacao.id}`}>Resenha</label>
                      <textarea
                        id={`resenha-${avaliacao.id}`}
                        value={editDraft.resenha}
                        onChange={(event) =>
                          setEditDraft((current) => ({
                            ...current,
                            resenha: event.target.value,
                          }))
                        }
                        maxLength={5000}
                      />

                      <div className="minhas-avaliacoes__edit-actions">
                        <Button
                          onClick={() => handleUpdate(avaliacao.id)}
                          disabled={savingId === avaliacao.id}
                        >
                          {savingId === avaliacao.id ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button variant="secondary" onClick={cancelEdit}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="minhas-avaliacoes__rating">
                        <strong>{avaliacao.nota}/5</strong>
                        <span>Nota registrada</span>
                      </div>

                      <p className="minhas-avaliacoes__review">
                        {avaliacao.resenha || 'Sem resenha escrita para esta avaliação.'}
                      </p>

                      <div className="minhas-avaliacoes__item-actions">
                        <Button variant="secondary" onClick={() => startEdit(avaliacao)}>
                          Editar
                        </Button>
                        <button
                          type="button"
                          className="minhas-avaliacoes__delete"
                          onClick={() => handleDelete(avaliacao)}
                          disabled={deletingId === avaliacao.id}
                        >
                          {deletingId === avaliacao.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default MinhasAvaliacoes;
