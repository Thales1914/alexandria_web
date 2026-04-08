import { useState } from 'react';
import { Link } from 'react-router-dom';
import { biblioteca } from '../data/Livros';
import Input from '../components/Input';
import '../styles/pages/Explorar.css';

const Explorar = () => {
  const [filtro, setFiltro] = useState('Todos');
  const [busca, setBusca] = useState('');

  const livrosFiltrados = biblioteca.filter(livro => {
    const matchCategoria = filtro === 'Todos' || livro.categoria === filtro || (filtro === 'Sci-Fi' && livro.categoria === 'Ficção Científica');
    const matchBusca = livro.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      livro.autor.toLowerCase().includes(busca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  const categorias = ['Todos', 'Clássicos', 'Fantasia', 'Romance', 'Distopia', 'Psicológico', 'Sci-Fi'];
  const destaques = biblioteca.slice(0, 4);

  return (
    <div className="explorar">
      <section className="explorar__hero">
        <h1 className="explorar__title">Expanda seus Horizontes Literários</h1>
        <p className="explorar__subtitle">Mergulhe em milhares de histórias e clássicos atemporais.</p>
        
        <div className="explorar__search">
          <Input
            id="search"
            type="text"
            placeholder="Busque por título, autor, gênero..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </section>

      <div className="explorar__layout">
        <aside className="explorar__sidebar">
          <h3>Categorias</h3>
          <ul className="explorar__categories">
            {categorias.map(cat => (
              <li key={cat}>
                <button
                  className={`explorar__cat-btn ${filtro === cat ? 'explorar__cat-btn--active' : ''}`}
                  onClick={() => setFiltro(cat)}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="explorar__content">
          <section className="explorar__section">
            <h2>Em Destaque</h2>
            <div className="explorar__destaques-grid">
              {destaques.map(livro => (
                <div key={livro.id} className="destaque-card">
                  <img src={livro.capa} alt={livro.titulo} />
                  <div className="destaque-card__info">
                    <h4>{livro.titulo}</h4>
                    <span>{livro.autor}</span>
                    <p>{livro.sinopse}</p>
                    <Link to={`/livro/${livro.id}`}>Ver detalhes</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="explorar__section">
            <h2>Acervo</h2>
            <div className="explorar__acervo-grid">
              {livrosFiltrados.map(livro => (
                <Link to={`/livro/${livro.id}`} key={livro.id} className="acervo-card">
                  <img src={livro.capa} alt={livro.titulo} />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Explorar;