import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/pages/Profile.css";

const Perfil = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <header className="profile-header">
          <div className="profile-avatar-large">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
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
          </div>
          <h1>Meu Perfil</h1>
          <p>Informações básicas da sua conta</p>
        </header>

        <div className="profile-info">
          <div className="profile-field">
            <label>Nome Completo</label>
            <div className="profile-field-value">{user?.name}</div>
          </div>

          <div className="profile-field">
            <label>Email de Acesso</label>
            <div className="profile-field-value">{user?.email}</div>
          </div>

          <div className="profile-field">
            <label>Senha</label>
            <div className="profile-field-value">••••••••</div>
          </div>
        </div>

        <footer className="profile-footer">
          <button className="profile-logout-btn" onClick={() => { logout(); navigate("/"); }}>
            Sair da Conta
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Perfil;
