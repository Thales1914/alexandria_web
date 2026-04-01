import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import '../styles/pages/NotFound.css';

function NotFound({
  eyebrow = 'Alexandria',
  code = '404',
  title = 'Página não encontrada',
  message = 'O caminho informado não existe no Alexandria. Volte para a página inicial e continue sua navegação.',
  actionLabel = 'Voltar para a Home',
  actionTo = '/',
}) {
  const navigate = useNavigate();
  const cardClassName = `not-found__card${code ? '' : ' not-found__card--simple'}`;

  return (
    <section className="not-found">
      <div className={cardClassName}>
        <p className="not-found__eyebrow">{eyebrow}</p>
        {code ? <span className="not-found__code">{code}</span> : null}
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="not-found__actions">
          <Button onClick={() => navigate(actionTo)} variant="secondary">
            {actionLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
