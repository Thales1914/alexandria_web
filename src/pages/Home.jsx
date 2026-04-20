import { useState } from 'react';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import Input from '../components/Input';
import '../styles/pages/Home.css';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);

  const handleSearch = (event) => {
    event.preventDefault();

    const normalizedSearch = searchTerm.trim();

    if (!normalizedSearch) {
      setAlert({
        type: 'error',
        message: 'Informe o nome de um livro para realizar a pesquisa.',
      });
      return;
    }

    setAlert({
      type: 'success',
      message: `Busca por "${normalizedSearch}" pronta para integracao com o backend Java do Alexandria.`,
    });
  };

  const handleChange = (event) => {
    setSearchTerm(event.target.value);

    if (alert) {
      setAlert(null);
    }
  };

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">Biblioteca digital</p>
          <h1>Alexandria</h1>
          <p className="hero-text">
            Organize leituras, acompanhe sua biblioteca pessoal e encontre
            livros em um ambiente centralizado, simples e intuitivo.
          </p>
        </div>
      </section>

      <section className="section" id="busca">
        <div className="home-panel">
          <div className="home-panel__header">
            <h2>Pesquisar livro</h2>
            <p>
              Busque obras e mantenha sua experiencia de leitura organizada em
              um unico lugar.
            </p>
          </div>

          <form className="home-form" onSubmit={handleSearch}>
            <Input
              id="book-search"
              label="Livro"
              placeholder="Ex.: O Hobbit"
              value={searchTerm}
              onChange={handleChange}
            />
            <Button type="submit">Pesquisar</Button>
          </form>

          <AlertMessage type={alert?.type} message={alert?.message} />
        </div>
      </section>

      <section className="section">
        <h2>Como o Alexandria ajuda</h2>
        <div className="home-info-grid">
          <article className="home-info-card">
            <span className="home-info-card__tag">Organizacao</span>
            <h3>Biblioteca pessoal</h3>
            <p>
              Reuna seus livros, acompanhe leituras e mantenha sua colecao
              sempre acessivel.
            </p>
          </article>

          <article className="home-info-card">
            <span className="home-info-card__tag">Navegacao</span>
            <h3>Experiencia clara</h3>
            <p>
              Uma interface direta para navegar pela plataforma com mais
              conforto e foco no que importa.
            </p>
          </article>

          <article className="home-info-card">
            <span className="home-info-card__tag">Descoberta</span>
            <h3>Busca de livros</h3>
            <p>
              Encontre obras com mais facilidade e acesse informacoes relevantes
              para apoiar sua jornada de leitura.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default Home;
