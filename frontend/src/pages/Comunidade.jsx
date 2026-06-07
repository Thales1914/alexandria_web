import { useCallback, useEffect, useMemo, useState } from 'react';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useGamificacao } from '../context/GamificacaoContext';
import {
  alternarCurtidaPublicacao,
  criarPublicacaoComunidade,
  listarPublicacoesComunidade,
  removerPublicacaoComunidade,
} from '../services/comunidade';
import '../styles/pages/Comunidade.css';

const MIN_CONTENT_LENGTH = 5;
const MAX_CONTENT_LENGTH = 1000;

function formatTimeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();

  if (Number.isNaN(diff) || diff < 60_000) {
    return 'Agora';
  }

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) {
    return `Há ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Há ${hours} h`;
  }

  const days = Math.floor(hours / 24);
  return `Há ${days} dia(s)`;
}

function normalizeContent(value) {
  return value.trim().replace(/[\t\v\f\r ]+/g, ' ');
}

function Comunidade() {
  const { token, user } = useAuth();
  const { ganharXP, registrarStats } = useGamificacao();
  const accountName = (user?.name || '').trim();
  const accountEmail = (user?.email || '').trim().toLowerCase();
  const accountInitial = (accountName || accountEmail || '?').charAt(0).toUpperCase();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [actionPostId, setActionPostId] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await listarPublicacoesComunidade(token);
      setPosts(response || []);
    } catch (err) {
      setPosts([]);
      setError(err.message || 'Não foi possível carregar a comunidade.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const totalPosts = posts.length;
  const activeReaders = useMemo(() => {
    const uniqueAuthors = new Set(
      posts.map((post) => (post.authorEmail || post.authorName || '').toLowerCase()).filter(Boolean)
    );
    return uniqueAuthors.size;
  }, [posts]);

  const myPosts = useMemo(() => {
    return posts.filter((post) => post.ownedByMe || post.authorEmail?.toLowerCase() === accountEmail).length;
  }, [accountEmail, posts]);

  const myLikes = useMemo(
    () => posts.reduce((count, post) => count + (post.likedByMe ? 1 : 0), 0),
    [posts]
  );

  useEffect(() => {
    registrarStats({ posts: myPosts });
  }, [myPosts, registrarStats]);

  const contentLength = draft.trim().length;
  const canPublish = contentLength >= MIN_CONTENT_LENGTH && contentLength <= MAX_CONTENT_LENGTH && !publishing;

  const handlePublish = async (event) => {
    event.preventDefault();
    const normalizedContent = normalizeContent(draft);

    if (!accountName || !accountEmail) {
      setError('Complete seu nome e email no perfil para publicar na comunidade.');
      return;
    }

    if (normalizedContent.length < MIN_CONTENT_LENGTH) {
      setError(`Escreva pelo menos ${MIN_CONTENT_LENGTH} caracteres para publicar.`);
      return;
    }

    if (normalizedContent.length > MAX_CONTENT_LENGTH) {
      setError(`A publicação pode ter no máximo ${MAX_CONTENT_LENGTH} caracteres.`);
      return;
    }

    setPublishing(true);
    setError('');
    setSuccess('');

    try {
      const created = await criarPublicacaoComunidade(normalizedContent, token);
      setPosts((current) => [created, ...current]);
      setDraft('');
      setSuccess('Publicação criada.');
      ganharXP('PUBLICAR_COMUNIDADE');
    } catch (err) {
      setError(err.message || 'Não foi possível publicar agora.');
    } finally {
      setPublishing(false);
    }
  };

  const toggleLike = async (id) => {
    setActionPostId(id);
    setError('');
    setSuccess('');

    try {
      const updated = await alternarCurtidaPublicacao(id, token);
      setPosts((current) => current.map((post) => (post.id === id ? updated : post)));
    } catch (err) {
      setError(err.message || 'Não foi possível atualizar a curtida.');
    } finally {
      setActionPostId(null);
    }
  };

  const deletePost = async (post) => {
    const confirmed = window.confirm('Remover esta publicação da comunidade?');

    if (!confirmed) {
      return;
    }

    setActionPostId(post.id);
    setError('');
    setSuccess('');

    try {
      await removerPublicacaoComunidade(post.id, token);
      setPosts((current) => current.filter((item) => item.id !== post.id));
      setSuccess('Publicação removida.');
    } catch (err) {
      setError(err.message || 'Não foi possível remover a publicação.');
    } finally {
      setActionPostId(null);
    }
  };

  return (
    <div className="comunidade">
      <header className="comunidade__header">
        <div>
          <p className="comunidade__eyebrow">Comunidade</p>
          <h1>Troque leituras com outros leitores</h1>
          <p className="comunidade__subtitle">
            Compartilhe recomendações, publique opiniões e acompanhe as interações da sua conta.
          </p>
        </div>
        <div className="comunidade__stats">
          <div>
            <strong>{totalPosts}</strong>
            <span>Publicações</span>
          </div>
          <div>
            <strong>{activeReaders}</strong>
            <span>Leitores ativos</span>
          </div>
        </div>
      </header>

      {error && <AlertMessage type="error" title="Falha" message={error} />}
      {success && <AlertMessage type="success" title="Tudo certo" message={success} />}

      <div className="comunidade__grid">
        <aside className="comunidade__sidebar">
          <section className="comunidade__card">
            <div className="comunidade__profile-avatar">{accountInitial}</div>
            <h2>{accountName || 'Sem nome cadastrado'}</h2>
            <p>{accountEmail || 'Email não informado'}</p>
          </section>

          <section className="comunidade__card">
            <h3>Sua atividade</h3>
            <ul className="comunidade__activity-list">
              <li>
                <span>Publicações criadas</span>
                <strong>{myPosts}</strong>
              </li>
              <li>
                <span>Curtidas dadas</span>
                <strong>{myLikes}</strong>
              </li>
            </ul>
          </section>
        </aside>

        <main className="comunidade__feed">
          <section className="comunidade__card">
            <form className="comunidade__composer" onSubmit={handlePublish}>
              <div className="comunidade__composer-header">
                <label htmlFor="post">Nova publicação</label>
                <span className={contentLength > MAX_CONTENT_LENGTH ? 'comunidade__counter comunidade__counter--error' : 'comunidade__counter'}>
                  {contentLength}/{MAX_CONTENT_LENGTH}
                </span>
              </div>
              <textarea
                id="post"
                className="comunidade__textarea"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={MAX_CONTENT_LENGTH + 100}
                placeholder="Compartilhe uma recomendação, trecho ou opinião..."
              />

              <div className="comunidade__actions">
                <Button type="button" variant="secondary" onClick={() => setDraft('')} disabled={publishing || !draft}>
                  Limpar
                </Button>
                <Button type="submit" disabled={!canPublish}>
                  {publishing ? 'Publicando...' : 'Publicar'}
                </Button>
              </div>
            </form>
          </section>

          {loading ? (
            <section className="comunidade__card comunidade__empty">
              <h3>Carregando publicações...</h3>
              <p>Aguarde enquanto buscamos o feed da comunidade.</p>
            </section>
          ) : posts.length === 0 ? (
            <section className="comunidade__card comunidade__empty">
              <h3>Nenhuma publicação ainda</h3>
              <p>Seja a primeira pessoa a compartilhar uma leitura.</p>
            </section>
          ) : (
            posts.map((post) => {
              const canDelete = post.ownedByMe || post.authorEmail?.toLowerCase() === accountEmail;
              const isBusy = actionPostId === post.id;

              return (
                <section key={post.id} className="comunidade__card">
                  <div className="comunidade__activity-header">
                    <div className="comunidade__activity-avatar">
                      {(post.authorName || post.authorEmail || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{post.authorName}</strong>
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>

                  <p className="comunidade__post-content">{post.content}</p>

                  <div className="comunidade__post-actions">
                    <Button
                      type="button"
                      variant={post.likedByMe ? 'primary' : 'secondary'}
                      onClick={() => toggleLike(post.id)}
                      disabled={isBusy}
                    >
                      {post.likedByMe ? `Curtido (${post.likes})` : `Curtir (${post.likes})`}
                    </Button>
                    {canDelete && (
                      <button
                        type="button"
                        className="comunidade__delete-btn"
                        onClick={() => deletePost(post)}
                        disabled={isBusy}
                      >
                        {isBusy ? 'Removendo...' : 'Remover'}
                      </button>
                    )}
                  </div>
                </section>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}

export default Comunidade;
