import { Link, useLocation } from 'react-router-dom';
import '../styles/components/Footer.css';

function Footer() {
  const location = useLocation();
  const hiddenRoutes = ['/explorar', '/comunidade'];

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__brand">
          <span className="footer__logo">Alexandria</span>
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
