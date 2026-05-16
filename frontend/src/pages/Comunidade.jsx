import { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useGamificacao } from '../context/GamificacaoContext';
import '../styles/pages/Comunidade.css';

const STORAGE_KEY = 'alexandria.community.posts';

function readStoredPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (post) =>
        post?.id &&
        post?.content &&
        post?.createdAt &&
        typeof post.authorName === 'string' &&
        post.authorName.trim().length > 0 &&
        typeof post.authorEmail === 'string' &&
        post.authorEmail.trim().length > 0
    );
  } catch {
    return [];
  }
}

function formatTimeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  if (Number.isNaN(diff) || diff < 60_000) return 'Agora';
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `Há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Há ${days} dia(s)`;
}

function buildPost(content, authorName, authorEmail) {
  return {
    id: crypto.randomUUID(),
    content,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedByMe: false,
    authorName,
    authorEmail,
  };
}

function Comunidade() {
  const { user } = useAuth();
  const { ganharXP, registrarStats } = useGamificacao();
  const accountName = (user?.name || '').trim();
  const accountEmail = (user?.email || '').trim().toLowerCase();
  const accountInitial = (accountName || accountEmail || '?').charAt(0).toUpperCase();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [posts, setPosts] = useState(readStoredPosts);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const totalPosts = posts.length;
  const activeReaders = useMemo(() => {
    const unique = new Set(posts.map((p) => (p.authorEmail || p.authorName).toLowerCase()));
    return unique.size;
  }, [posts]);

  const myPosts = useMemo(() => {
    if (!accountEmail) return 0;
    return posts.filter((p) => p.authorEmail.toLowerCase() === accountEmail).length;
  }, [accountEmail, posts]);

  const myLikes = useMemo(
    () => posts.reduce((count, post) => count + (post.likedByMe ? 1 : 0), 0),
    [posts]
  );

  const handlePublish = (event) => {
    event.preventDefault();
    const normalizedContent = draft.trim();

    if (!accountName || !accountEmail) {
      setError('Complete seu nome e email no perfil para publicar na comunidade.');
      return;
    }

    if (normalizedContent.length < 5) {
      setError('Escreva pelo menos 5 caracteres para publicar.');
      return;
    }

    const novoPost = buildPost(normalizedContent, accountName, accountEmail);
    const novosPosts = [novoPost, ...posts];
    setPosts(novosPosts);
    setDraft('');
    setError('');

    // ── XP por publicar ────────────────────────────────────────────────────
    ganharXP('PUBLICAR_COMUNIDADE');
    registrarStats({ posts: myPosts + 1 });
  };

  const toggleLike = (id) => {
    setPosts((current) =>
      current.map((post) => {
        if (post.id !== id) return post;
        const likedByMe = !post.likedByMe;
        return { ...post, likedByMe, likes: post.likes + (likedByMe ? 1 : -1) };
      })
    );
  };

  const deletePost = (id) => {
    setPosts((current) => current.filter((post) => post.id !== id));
  };
 //se um post for deletado depois vi ser necessario colocar uma açao para remover xp dele.                                               
//tambem lembrar de atualzar os stats de post e xp e nao dar pau nas conquistas.

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
              <label htmlFor="post">Nova publicação</label>
              <textarea
                id="post"
                className="comunidade__textarea"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Compartilhe uma recomendação, trecho ou opinião..."
              />
              {error ? <p className="comunidade__error">{error}</p> : null}
              <div className="comunidade__actions">
                <Button type="button" variant="secondary" onClick={() => setDraft('')}>
                  Limpar
                </Button>
                <Button type="submit">Publicar</Button>
              </div>
            </form>
          </section>

          {posts.length === 0 ? (
            <section className="comunidade__card comunidade__empty">
              <h3>Nenhuma publicação ainda</h3>
              <p>Seja a primeira pessoa a compartilhar</p>
            </section>
          ) : (
            posts.map((post) => {
              const canDelete = (post.authorEmail || '').toLowerCase() === accountEmail;
              return (
                <section key={post.id} className="comunidade__card">
                  <div className="comunidade__activity-header">
                    <div className="comunidade__activity-avatar">
                      {(post.authorName || post.authorEmail).charAt(0).toUpperCase()}
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
                    >
                      {post.likedByMe ? `Curtido (${post.likes})` : `Curtir (${post.likes})`}
                    </Button>
                    {canDelete && (
                      <button
                        type="button"
                        className="comunidade__delete-btn"
                        onClick={() => deletePost(post.id)}
                      >
                        Remover
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
