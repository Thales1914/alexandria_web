import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/components/Navbar.css";

function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/cadastro";

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

        {!isAuthPage && (
          <nav className="navbar__auth" aria-label="Autenticação">
            {isLoggedIn ? (
              <NavLink className="navbar__avatar" to="/perfil" title="Meu Perfil">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </NavLink>
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
