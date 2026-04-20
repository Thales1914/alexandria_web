import { NavLink } from 'react-router-dom';
import '../styles/components/Navbar.css';

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink className="navbar__brand" to="/">
          Alexandria
        </NavLink>

        <nav className="navbar__nav" aria-label="Principal">
          <NavLink
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
            to="/explorar"
          >
            Explorar
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
            to="/comunidade"
          >
            Comunidade
          </NavLink>
        </nav>

        <div className="navbar__tools">
          <div className="navbar__search">
            <input
              aria-label="Busca rapida"
              placeholder="Buscar livros..."
              type="text"
            />
          </div>
          <NavLink className="navbar__link" to="/login">
            Entrar
          </NavLink>
        </div>
      </div>
    </header>
  );
}

export default Navbar;