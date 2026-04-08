import { useLocation } from 'react-router-dom';
import '../styles/components/Footer.css';

const Footer = () => {
  const location = useLocation();
  const hiddenRoutes = ['/explorar', '/comunidade', '/login', '/cadastro'];

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__brand">
          <span className="footer__logo">Alexandria</span>
          <p className="footer__slogan">Sua biblioteca digital e rede de conhecimento. Descubra, organize e conecte-se com outros exploradores literários.</p>
        </div>

        <div className="footer__links">
          <div className="footer__group">
            <h4>Navegação</h4>
            <a href="/">Início</a>
            <a href="/explorar">Catálogo</a>
            <a href="/comunidade">Comunidade</a>
          </div>
          <div className="footer__group">
            <h4>Plataforma</h4>
            <a href="/sobre">Sobre Nós</a>
            <a href="/diretrizes">Diretrizes</a>
          </div>
        </div>
      </div>
      <div className="footer__bottom">
        <p>&copy; 2026 Alexandria. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;