import { useState } from 'react';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import Input from '../components/Input';
import '../styles/pages/Home.css';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [inputState, setInputState] = useState('default');
  const [inputMessage, setInputMessage] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();

    const normalizedSearch = searchTerm.trim();

    if (!normalizedSearch) {
      setInputState('error');
      setInputMessage('Digite o título de um livro para continuar.');
      setAlert({
        type: 'error',
        title: 'Busca não iniciada',
        message: 'Preencha o campo com o nome de um livro antes de pesquisar.',
      });
      return;
    }

    setInputState('success');
    setInputMessage('Título informado corretamente.');
    setAlert({
      type: 'success',
      title: 'Busca pronta',
      message: `Pesquisa preparada para "${normalizedSearch}".`,
    });
  };

  const handleChange = (event) => {
    const { value } = event.target;

    setSearchTerm(value);

    if (alert) {
      setAlert(null);
    }

    if (!value.trim()) {
      setInputState('default');
      setInputMessage('');
      return;
    }

    setInputState('default');
    setInputMessage('');
  };

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">Catálogo pessoal de livros</p>
          <h1>Descubra livros, registre avaliações e organize sua biblioteca.</h1>
          <p className="hero-text">
            O Alexandria reúne busca, notas e biblioteca pessoal em uma
            experiência simples para catalogar livros e guardar suas opiniões.
          </p>
        </div>
      </section>

      <section className="section" id="busca">
        <div className="home-panel">
          <div className="home-panel__header">
            <h2>Buscar livro</h2>
            <p>
              Pesquise pelo título de uma obra para iniciar sua experiência no
              Alexandria.
            </p>
          </div>

          <form className="home-form" onSubmit={handleSearch}>
            <Input
              hint="No momento, a interface valida a busca e prepara o frontend para a integração futura."
              id="book-search"
              label="Livro"
              onChange={handleChange}
              placeholder="Ex.: Dom Casmurro"
              state={inputState}
              stateMessage={inputMessage}
              value={searchTerm}
            />
            <Button type="submit">Pesquisar</Button>
          </form>

          <AlertMessage
            message={alert?.message}
            title={alert?.title}
            type={alert?.type}
          />
        </div>
      </section>

      <section className="section">
        <h2>Como o Alexandria ajuda</h2>
        <div className="home-info-grid">
          <article className="home-info-card">
            <span className="home-info-card__tag">Catálogo</span>
            <h3>Biblioteca pessoal</h3>
            <p>
              Reúna seus livros em um só lugar e mantenha sua coleção organizada
              com mais clareza.
            </p>
          </article>

          <article className="home-info-card">
            <span className="home-info-card__tag">Avaliações</span>
            <h3>Notas e opiniões</h3>
            <p>
              Registre impressões, dê notas e mantenha suas avaliações ligadas a
              cada obra.
            </p>
          </article>

          <article className="home-info-card">
            <span className="home-info-card__tag">Descoberta</span>
            <h3>Busca centralizada</h3>
            <p>
              Encontre títulos com rapidez e deixe a interface pronta para a
              busca real de livros no próximo passo.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default Home;
