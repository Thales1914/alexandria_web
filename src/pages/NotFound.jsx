import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import '../styles/pages/NotFound.css';

function NotFound() {
  const navigate = useNavigate();

  return (
    <section className="not-found">
      <div className="not-found__card">
        <span className="not-found__code">404</span>
        <h1>Pagina nao encontrada</h1>
        <p>
          O caminho informado nao existe no Alexandria. Volte para a pagina
          inicial e continue sua navegacao.
        </p>
        <Button onClick={() => navigate('/')} variant="secondary">
          Voltar para a Home
        </Button>
      </div>
    </section>
  );
}

export default NotFound;
