import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { salvarNaBiblioteca, STATUS_LEITURA } from '../services/biblioteca';
import { criarAvaliacao } from '../services/avaliacoes';
import { getBookDetails } from '../services/livros';
import NotFound from './NotFound';
import '../styles/pages/LivroDetalhe.css';

const REVIEW_RATINGS = [1, 2, 3, 4, 5];

function LivroDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('QUERO_LER');
  const [saving, setSaving] = useState(false);
  const [savedEntry, setSavedEntry] = useState(null);
  const [nota, setNota] = useState(5);
  const [resenha, setResenha] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadBook = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getBookDetails(id, token);
        if (!cancelled) {
          setBook(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Nao foi possivel carregar os detalhes do livro.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBook();

    return () => {
      cancelled = true;
    };
  }, [id, token]);

  const handleSave = async () => {
    if (!user?.id) {
      setError('Nao foi possivel identificar o usuario autenticado.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await salvarNaBiblioteca({
        usuarioId: user.id,
        googleBookId: id,
        statusLeitura: selectedStatus,
        token,
      });
      setSavedEntry(response);
      setSuccessMessage('Livro adicionado a sua biblioteca.');
    } catch (err) {
      setError(err.message || 'Nao foi possivel salvar o livro na biblioteca.');
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (event) => {
    event.preventDefault();

    const livroId = savedEntry?.livro?.id || book?.databaseId;

    if (!user?.id || !livroId) {
      setError('Adicione o livro a biblioteca antes de avaliar.');
      return;
    }

    setReviewLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await criarAvaliacao({
        usuarioId: user.id,
        livroId,
        nota: Number(nota),
        resenha,
        token,
      });
      setSuccessMessage('Avaliacao registrada com sucesso.');
      setResenha('');
    } catch (err) {
      setError(err.message || 'Nao foi possivel registrar a avaliacao.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (!loading && !book && error) {
    return (
      <NotFound
        eyebrow="Detalhes do livro"
        code=""
        title="Livro nao encontrado"
        message={error}
        actionLabel="Voltar para explorar"
        actionTo="/explorar"
      />
    );
  }

  return (
    <section className="livro-detalhe">
      {error && book && (
        <AlertMessage
          type="error"
          title="Nao foi possivel concluir"
          message={error}
        />
      )}

      {successMessage && (
        <AlertMessage
          type="success"
          title="Tudo certo"
          message={successMessage}
        />
      )}

      {loading ? (
        <div className="livro-detalhe__status">
          <h2>Carregando detalhes do livro...</h2>
          <p>Aguarde enquanto os detalhes sao carregados.</p>
        </div>
      ) : (
        <div className="livro-detalhe__card">
          <img src={book.thumbnail} alt={book.title} />

          <div className="livro-detalhe__content">
            <p className="livro-detalhe__eyebrow">{book.categories[0] || 'Livro'}</p>
            <h1>{book.title}</h1>
            {book.subtitle ? <p className="livro-detalhe__subtitle">{book.subtitle}</p> : null}
            <p className="livro-detalhe__author">{book.authors}</p>

            <div className="livro-detalhe__meta">
              <span>Publicado em: {book.publishedDate}</span>
              <span>Paginas: {book.pageCount || 'n/d'}</span>
              <span>Idioma: {book.language.toUpperCase()}</span>
            </div>

            <p className="livro-detalhe__synopsis">{book.description}</p>

            <div className="livro-detalhe__actions">
              <label className="livro-detalhe__select-label" htmlFor="status-leitura">
                Status inicial
              </label>
              <select
                id="status-leitura"
                className="livro-detalhe__select"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
              >
                {Object.entries(STATUS_LEITURA).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : 'Adicionar a biblioteca'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/explorar')}>
                Voltar para explorar
              </Button>
            </div>

            <form className="livro-detalhe__review" onSubmit={handleReview}>
              <div>
                <h2>Avaliar livro</h2>
                <p>Depois de salvar na biblioteca, registre sua nota e resenha.</p>
              </div>

              <fieldset className="livro-detalhe__rating">
                <legend>Nota</legend>
                <div className="livro-detalhe__rating-options">
                  {REVIEW_RATINGS.map((value) => {
                    const isActive = value <= Number(nota);

                    return (
                      <button
                        key={value}
                        type="button"
                        className={`livro-detalhe__rating-button${
                          isActive ? ' livro-detalhe__rating-button--active' : ''
                        }`}
                        onClick={() => setNota(value)}
                        aria-pressed={Number(nota) === value}
                        aria-label={`${value} de 5`}
                      >
                        <span aria-hidden="true">★</span>
                      </button>
                    );
                  })}
                  <strong>{nota}/5</strong>
                </div>
              </fieldset>

              <label htmlFor="resenha">Resenha</label>
              <textarea
                id="resenha"
                className="livro-detalhe__textarea"
                value={resenha}
                onChange={(event) => setResenha(event.target.value)}
                placeholder="Escreva sua opiniao sobre a leitura..."
              />

              <Button type="submit" variant="secondary" disabled={reviewLoading}>
                {reviewLoading ? 'Registrando...' : 'Salvar avaliacao'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default LivroDetalhe;
