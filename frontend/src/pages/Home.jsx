import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import Input from '../components/Input';
import '../styles/pages/Home.css';

const SHOWCASE_BOOKS = [
  {
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    category: 'Literatura brasileira',
    tone: 'linear-gradient(145deg, #18394a 0%, #2f6f73 52%, #d9b56f 100%)',
  },
  {
    title: 'Torto Arado',
    author: 'Itamar Vieira Junior',
    category: 'Romance contemporaneo',
    tone: 'linear-gradient(145deg, #331d2c 0%, #8f3f4d 54%, #e0a458 100%)',
  },
  {
    title: 'O Hobbit',
    author: 'J. R. R. Tolkien',
    category: 'Fantasia',
    tone: 'linear-gradient(145deg, #1f3b2f 0%, #587d48 50%, #f2cc8f 100%)',
  },
  {
    title: '1984',
    author: 'George Orwell',
    category: 'Ficcao politica',
    tone: 'linear-gradient(145deg, #22131f 0%, #6d2f52 54%, #ff6b6b 100%)',
  },
];

const PRODUCT_FEATURES = [
  {
    label: 'Busca',
    title: 'Encontre livros pelo catalogo',
    text: 'Pesquise obras e visualize dados essenciais como titulo, autor, capa e descricao.',
  },
  {
    label: 'Biblioteca',
    title: 'Monte uma estante organizada',
    text: 'Salve livros em um unico lugar e mantenha sua jornada de leitura facil de consultar.',
  },
  {
    label: 'Avaliacao',
    title: 'Registre nota e resenha',
    text: 'Guarde opinioes sobre cada obra e transforme leituras em historico pessoal.',
  },
];

const WORKFLOW_STEPS = [
  'Buscar livros no catalogo',
  'Abrir detalhes da obra',
  'Adicionar a biblioteca',
  'Organizar e avaliar depois',
];

function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [inputState, setInputState] = useState('default');
  const [inputMessage, setInputMessage] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();

    const normalizedSearch = searchTerm.trim();

    if (!normalizedSearch) {
      setInputState('error');
      setInputMessage('Digite o titulo de um livro para continuar.');
      setAlert({
        type: 'error',
        title: 'Busca nao iniciada',
        message: 'Preencha o campo com o nome de um livro antes de pesquisar.',
      });
      return;
    }

    navigate(`/explorar?q=${encodeURIComponent(normalizedSearch)}`);
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
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="home-kicker">Alexandria</p>
          <h1>Uma biblioteca pessoal para descobrir, organizar e lembrar livros.</h1>
          <p className="home-hero__text">
            Busque obras, veja detalhes importantes e construa sua jornada de leitura
            em uma experiencia web clara, bonita e focada em livros.
          </p>

          <form className="home-search" onSubmit={handleSearch}>
            <Input
              hint="Busque por titulo, autor ou tema."
              id="book-search"
              label="Buscar no catalogo"
              onChange={handleChange}
              placeholder="Ex.: Machado de Assis"
              state={inputState}
              stateMessage={inputMessage}
              value={searchTerm}
            />
            <Button type="submit">Explorar</Button>
          </form>

          <AlertMessage
            message={alert?.message}
            title={alert?.title}
            type={alert?.type}
          />

          <div className="home-hero__actions">
            <Button onClick={() => navigate('/cadastro')}>Comecar agora</Button>
            <Link className="home-text-link" to="/explorar">
              Ver catalogo
            </Link>
          </div>

          <div className="home-tags" aria-label="Recursos do Alexandria">
            <span>Busca de livros</span>
            <span>Biblioteca pessoal</span>
            <span>Notas e resenhas</span>
          </div>
        </div>

        <div className="home-hero__showcase" aria-label="Previa visual do Alexandria">
          <div className="home-showcase__header">
            <span>Previa da experiencia</span>
            <strong>Web app</strong>
          </div>

          <div className="home-showcase__search">
            <span>Buscar livro</span>
            <strong>literatura brasileira</strong>
          </div>

          <div className="home-cover-row">
            {SHOWCASE_BOOKS.map((book) => (
              <article key={book.title} className="home-book-card">
                <div
                  className="home-book-cover"
                  style={{ '--cover-tone': book.tone }}
                >
                  <span>{book.title}</span>
                </div>
                <div>
                  <h2>{book.title}</h2>
                  <p>{book.author}</p>
                  <small>{book.category}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__header">
          <p className="home-kicker">O que o sistema entrega</p>
          <h2>Uma jornada simples da descoberta ate a avaliacao.</h2>
        </div>

        <div className="home-feature-grid">
          {PRODUCT_FEATURES.map((feature) => (
            <article key={feature.title} className="home-feature-card">
              <span>{feature.label}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-workflow">
        <div className="home-workflow__copy">
          <p className="home-kicker">Fluxo principal</p>
          <h2>Do catalogo para a biblioteca, sem perder contexto.</h2>
          <p>
            A tela inicial apresenta o produto sem depender de dados de usuario.
            Depois do login, cada pessoa encontra sua propria biblioteca e suas
            informacoes de leitura.
          </p>
        </div>

        <div className="home-workflow__steps">
          {WORKFLOW_STEPS.map((step, index) => (
            <article key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="home-closing">
        <div>
          <p className="home-kicker">Criado para web</p>
          <h2>Uma interface limpa para apresentar o Alexandria no pitch.</h2>
        </div>
        <Button onClick={() => navigate('/cadastro')}>Criar conta</Button>
      </section>
    </div>
  );
}

export default Home;
