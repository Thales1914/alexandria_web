import { NavLink } from "react-router-dom";
import "../styles/components/Navbar.css";

function Navbar() {
  const getLinkClassName = ({ isActive }) =>
    `navbar__link${isActive ? " navbar__link--active" : ""}`;

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
        </nav>

        <nav className="navbar__auth" aria-label="Autenticação">
          <NavLink className="navbar__auth-link" to="/login">
            Entrar
          </NavLink>
          <NavLink className="navbar__auth-btn" to="/cadastro">
            Cadastrar
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
