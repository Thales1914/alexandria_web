import { Link, useLocation } from 'react-router-dom';
import '../styles/components/Footer.css';

const HIDDEN_ROUTES = new Set(['/explorar', '/comunidade']);

function Footer() {
  const location = useLocation();
  if (HIDDEN_ROUTES.has(location.pathname)) return null;

  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__brand">
          <Link to="/" className="footer__logo" aria-label="Alexandria — Página inicial">
            <span>Alexandria</span>
          </Link>
          <p className="footer__slogan">
            Organize sua biblioteca pessoal, descubra livros e registre notas e
            avaliações em um só lugar.
          </p>
        </div>

        <div className="footer__links">
          <div className="footer__group">
            <h4>Navegação</h4>
            <Link to="/">Início</Link>
            <Link to="/explorar">Explorar</Link>
            <Link to="/conquistas">Conquistas</Link>
            <Link to="/comunidade">Comunidade</Link>
          </div>

          <div className="footer__group">
            <h4>Alexandria</h4>
            <span className="footer__text">Biblioteca pessoal</span>
            <span className="footer__text">Notas e avaliações</span>
            <span className="footer__text">Descoberta de livros</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; 2026 Alexandria. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

export default Footer;
