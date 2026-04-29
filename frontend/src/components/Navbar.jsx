import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import '../styles/components/Navbar.css';

const AUTH_PAGES = new Set([
  '/login',
  '/cadastro',
  '/esqueci-senha',
  '/redefinir-senha',
]);

function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const avatarInitial = (user?.name?.trim() || user?.email?.trim() || '?')
    .charAt(0)
    .toUpperCase();

  const isAuthPage = AUTH_PAGES.has(location.pathname);

  const getLinkClassName = ({ isActive }) =>
    `navbar__link${isActive ? ' navbar__link--active' : ''}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink className="navbar__brand" to="/">
          Alexandria
        </NavLink>

        <nav className="navbar__nav" aria-label="Principal">
          <NavLink className={getLinkClassName} end to="/">
            Home
          </NavLink>
          <NavLink className={getLinkClassName} to="/explorar">
            Explorar
          </NavLink>
          <NavLink className={getLinkClassName} to="/comunidade">
            Comunidade
          </NavLink>
          <NavLink className={getLinkClassName} to="/biblioteca">
            Biblioteca
          </NavLink>
        </nav>

        {!isAuthPage && (
          <nav className="navbar__auth" aria-label="Autenticacao">
            {isLoggedIn ? (
              <div className="navbar__actions">
                <NavLink
                  className={({ isActive }) =>
                    `navbar__avatar${isActive ? ' navbar__avatar--active' : ''}`
                  }
                  to="/perfil"
                  title="Meu perfil"
                >
                  <span>{avatarInitial}</span>
                </NavLink>
                <Button onClick={handleLogout} variant="secondary">
                  Sair
                </Button>
              </div>
            ) : (
              <>
                <NavLink className="navbar__auth-link" to="/login">
                  Entrar
                </NavLink>
                <NavLink className="navbar__auth-btn" to="/cadastro">
                  Cadastrar
                </NavLink>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

export default Navbar;
