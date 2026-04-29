import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { salvarNaBiblioteca } from '../services/biblioteca';
import { searchBooks } from '../services/livros';
import '../styles/pages/Explorar.css';

const CATEGORY_OPTIONS = [
  'Todos',
  'Fantasia',
  'Romance',
  'Historia',
  'Tecnologia',
  'Biografia',
  'Misterio',
];

const ORDER_OPTIONS = [
  { label: 'Mais relevantes', value: 'relevance' },
  { label: 'Mais recentes', value: 'newest' },
];

const QUALITY_OPTIONS = [
  { label: 'Precisos', value: 'precise', detail: 'Titulo ou autor' },
  { label: 'Curados', value: 'curated', detail: 'Capa e sinopse' },
  { label: 'Amplos', value: 'all', detail: 'Menos restricoes' },
];

const PAGE_SIZE = 6;
const MIN_QUERY_LENGTH = 3;

function normalizeTerm(value) {
  return (value || '').trim().replace(/\s+/g, ' ');
}

function Explorar() {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentQuery = normalizeTerm(searchParams.get('q') || '');
  const hasSearchTerm = currentQuery.length > 0;
  const hasValidSearchTerm = currentQuery.length >= MIN_QUERY_LENGTH;
  const selectedCategory = searchParams.get('categoria') || 'Todos';
  const selectedOrder = searchParams.get('ordem') || 'relevance';
  const selectedQuality = searchParams.get('qualidade') || 'precise';
  const [draftQuery, setDraftQuery] = useState(currentQuery);
  const [books, setBooks] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [queryHint, setQueryHint] = useState('');
  const [savingBookId, setSavingBookId] = useState('');
  const hasActiveFilters =
    selectedCategory !== 'Todos' || selectedOrder !== 'relevance' || selectedQuality !== 'precise';

  useEffect(() => {
    setDraftQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialResults = async () => {
      if (!hasSearchTerm) {
        setBooks([]);
        setTotalItems(0);
        setLoading(false);
        setError('');
        setQueryHint('');
        return;
      }

      if (!hasValidSearchTerm) {
        setBooks([]);
        setTotalItems(0);
        setLoading(false);
        setError('');
        setQueryHint(`Digite pelo menos ${MIN_QUERY_LENGTH} caracteres para buscar.`);
        return;
      }

      setLoading(true);
      setError('');
      setQueryHint('');

      try {
        const response = await searchBooks({
          query: currentQuery,
          subject: selectedCategory,
          orderBy: selectedOrder,
          startIndex: 0,
          maxResults: PAGE_SIZE,
          quality: selectedQuality,
          token,
        });

        if (!cancelled) {
          setBooks(response.items);
          setTotalItems(response.totalItems);
        }
      } catch (err) {
        if (!cancelled) {
          setBooks([]);
          setTotalItems(0);
          setError(err.message || 'Nao foi possivel carregar os livros agora.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialResults();

    return () => {
      cancelled = true;
    };
  }, [
    currentQuery,
    hasSearchTerm,
    hasValidSearchTerm,
    selectedCategory,
    selectedOrder,
    selectedQuality,
    token,
  ]);

  const hasMore = hasValidSearchTerm && books.length < totalItems;

  const updateSearchParams = (changes) => {
    const nextParams = new URLSearchParams(searchParams);

    Object.entries(changes).forEach(([key, value]) => {
      const shouldDelete =
        value === null ||
        value === undefined ||
        value === '' ||
        value === 'Todos' ||
        (key === 'ordem' && value === 'relevance') ||
        (key === 'qualidade' && value === 'precise');

      if (shouldDelete) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    setSearchParams(nextParams, { replace: true });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const normalizedDraft = normalizeTerm(draftQuery);
    if (!normalizedDraft) {
      setQueryHint('');
      setError('');
      updateSearchParams({ q: '' });
      return;
    }

    if (normalizedDraft.length < MIN_QUERY_LENGTH) {
      setQueryHint(`Digite pelo menos ${MIN_QUERY_LENGTH} caracteres para buscar.`);
      setError('');
      return;
    }

    setQueryHint('');
    setError('');
    updateSearchParams({ q: normalizedDraft });
  };

  const handleClearFilters = () => {
    updateSearchParams({
      categoria: 'Todos',
      ordem: 'relevance',
      qualidade: 'precise',
    });
  };

  const handleLoadMore = async () => {
    if (!hasValidSearchTerm) {
      return;
    }

    setLoadingMore(true);
    setError('');

    try {
      const response = await searchBooks({
        query: currentQuery,
        subject: selectedCategory,
        orderBy: selectedOrder,
        startIndex: books.length,
        maxResults: PAGE_SIZE,
        quality: selectedQuality,
        token,
      });

      setBooks((current) => [...current, ...response.items]);
      setTotalItems(response.totalItems);
    } catch (err) {
      setError(err.message || 'Nao foi possivel carregar mais resultados.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSaveBook = async (book) => {
    if (!user?.id) {
      setError('Nao foi possivel identificar o usuario autenticado.');
      return;
    }

    setSavingBookId(book.id);
    setError('');
    setSuccessMessage('');

    try {
      await salvarNaBiblioteca({
        usuarioId: user.id,
        googleBookId: book.id,
        token,
      });
      setSuccessMessage(`"${book.title}" foi adicionado a sua biblioteca.`);
    } catch (err) {
      setError(err.message || 'Nao foi possivel salvar o livro na biblioteca.');
    } finally {
      setSavingBookId('');
    }
  };

  return (
    <div className="explorar">
      <section className="explorar__hero">
        <p className="explorar__eyebrow">Explorar</p>
        <h1 className="explorar__title">Encontre livros para sua proxima leitura.</h1>
        <p className="explorar__subtitle">
          Pesquise, filtre e avance pelos resultados de forma rapida e organizada.
        </p>

        <form className="explorar__search-form" onSubmit={handleSearchSubmit}>
          <div className="explorar__search">
            <Input
              id="explorar-search"
              label="Buscar por titulo, autor ou assunto"
              placeholder="Ex.: Machado de Assis"
              value={draftQuery}
              onChange={(event) => {
                setDraftQuery(event.target.value);
                if (queryHint) {
                  setQueryHint('');
                }
              }}
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
      </section>

      <div className="explorar__layout">
        <aside className="explorar__sidebar">
          <div className="explorar__filter-header">
            <div>
              <p>Filtros</p>
              <span>{hasActiveFilters ? 'Busca refinada' : 'Padrao'}</span>
            </div>
            <button
              className="explorar__clear-filters"
              type="button"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              Limpar
            </button>
          </div>

          <div className="explorar__filter-block">
            <h2>Categorias</h2>
            <div className="explorar__categories">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  className={`explorar__category${
                    selectedCategory === category ? ' explorar__category--active' : ''
                  }`}
                  onClick={() => updateSearchParams({ categoria: category })}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="explorar__filter-block">
            <h2>Ordenacao</h2>
            <div className="explorar__segmented" role="group" aria-label="Ordenacao">
              {ORDER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`explorar__segment${
                    selectedOrder === option.value ? ' explorar__segment--active' : ''
                  }`}
                  type="button"
                  onClick={() => updateSearchParams({ ordem: option.value })}
                  aria-pressed={selectedOrder === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="explorar__filter-block">
            <h2>Qualidade</h2>
            <div className="explorar__quality-options">
              {QUALITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`explorar__quality${
                    selectedQuality === option.value ? ' explorar__quality--active' : ''
                  }`}
                  onClick={() => updateSearchParams({ qualidade: option.value })}
                  type="button"
                >
                  <span>{option.label}</span>
                  <small>{option.detail}</small>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="explorar__content">
          <div className="explorar__section-header">
            <div>
              <h2>
                {hasSearchTerm ? `Resultados para "${currentQuery}"` : 'Busque para carregar livros'}
              </h2>
              <p className="explorar__caption">
                {hasValidSearchTerm
                  ? selectedQuality === 'curated'
                    ? 'Resultados com boa apresentacao, capa e sinopse.'
                    : selectedQuality === 'precise'
                      ? 'Resultados com match forte no titulo ou autor.'
                      : 'Resultados amplos retornados pela busca.'
                  : 'Nenhuma consulta ativa. Digite um termo e clique em Buscar.'}
              </p>
            </div>
            <span>{hasValidSearchTerm ? `${totalItems} livro(s) encontrados` : '0 livro(s)'}</span>
          </div>

          {queryHint ? (
            <div className="explorar__status-card">
              <h3>Busca curta</h3>
              <p>{queryHint}</p>
            </div>
          ) : null}

          {error && (
            <div className="explorar__status-card">
              <AlertMessage
                type="error"
                title="Nao foi possivel concluir"
                message={error}
              />
            </div>
          )}

          {successMessage && (
            <div className="explorar__status-card">
              <AlertMessage
                type="success"
                title="Biblioteca atualizada"
                message={successMessage}
              />
            </div>
          )}

          {!hasSearchTerm ? (
            <div className="explorar__status-card">
              <h3>Comece sua busca</h3>
              <p>
                Digite um termo e clique em Buscar para encontrar livros por titulo, autor ou assunto.
              </p>
            </div>
          ) : !hasValidSearchTerm ? null : loading ? (
            <div className="explorar__status-card">
              <h3>Buscando livros...</h3>
              <p>Aguarde enquanto carregamos os resultados.</p>
            </div>
          ) : books.length === 0 ? (
            <div className="explorar__empty">
              <h3>Nenhum livro encontrado</h3>
              <p>Ajuste o termo, remova filtros ou tente outra categoria.</p>
            </div>
          ) : (
            <>
              <div className="explorar__grid">
                {books.map((book) => (
                  <article key={book.id} className="explorar__card">
                    <img src={book.thumbnail} alt={book.title} />
                    <div className="explorar__card-body">
                      <span className="explorar__tag">
                        {book.categories[0] || selectedCategory || 'Livro'}
                      </span>
                      <h3>{book.title}</h3>
                      <p className="explorar__author">{book.authors}</p>
                      <p className="explorar__synopsis">{book.description}</p>
                      <div className="explorar__card-actions">
                        <Link className="explorar__link" to={`/livro/${book.id}`}>
                          Ver detalhes
                        </Link>
                        <button
                          className="explorar__save-btn"
                          type="button"
                          onClick={() => handleSaveBook(book)}
                          disabled={savingBookId === book.id}
                        >
                          {savingBookId === book.id ? 'Salvando...' : 'Adicionar'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="explorar__pagination">
                {hasMore ? (
                  <Button variant="secondary" onClick={handleLoadMore} disabled={loadingMore}>
                    {loadingMore ? 'Carregando mais...' : 'Carregar mais resultados'}
                  </Button>
                ) : (
                  <span>Voce ja visualizou todos os resultados desta busca.</span>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Explorar;
