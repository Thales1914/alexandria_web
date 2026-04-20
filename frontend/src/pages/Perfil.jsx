import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../services/userService";
import "../styles/pages/Profile.css";

const Perfil = () => {
  const { user, token, logout, updateUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
    setName(user?.name || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Nome não pode ser vazio.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("A nova senha e a confirmação não coincidem.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);
      const data = { name };
      if (newPassword) {
        data.currentPassword = currentPassword;
        data.newPassword = newPassword;
      }

      const updated = await updateProfile(token, data);
      updateUser(updated.name);
      setIsEditing(false);
      setSuccess("Perfil atualizado com sucesso!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <header className="profile-header">
          <div className="profile-avatar-large">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1>Meu Perfil</h1>
          <p>{isEditing ? "Edite suas informações" : "Informações básicas da sua conta"}</p>
        </header>

        {error && <div className="profile-message profile-message--error">{error}</div>}
        {success && <div className="profile-message profile-message--success">{success}</div>}

        <div className="profile-info">
          <div className="profile-field">
            <label>Nome Completo</label>
            {isEditing ? (
              <input
                className="profile-field-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
              />
            ) : (
              <div className="profile-field-value">{user?.name}</div>
            )}
          </div>

          <div className="profile-field">
            <label>Email de Acesso</label>
            <div className="profile-field-value profile-field-value--disabled">
              {user?.email}
            </div>
          </div>

          {isEditing && (
            <>
              <div className="profile-field">
                <label>Senha Atual</label>
                <input
                  className="profile-field-input"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
                />
              </div>
              <div className="profile-field">
                <label>Nova Senha</label>
                <input
                  className="profile-field-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div className="profile-field">
                <label>Confirmar Nova Senha</label>
                <input
                  className="profile-field-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                />
              </div>
            </>
          )}

          {!isEditing && (
            <div className="profile-field">
              <label>Senha</label>
              <div className="profile-field-value">••••••••</div>
            </div>
          )}
        </div>

        <footer className="profile-footer">
          {isEditing ? (
            <div className="profile-footer-actions">
              <button className="profile-save-btn" onClick={handleSave} disabled={loading}>
                {loading ? "Salvando..." : "Salvar"}
              </button>
              <button className="profile-cancel-btn" onClick={handleCancel} disabled={loading}>
                Cancelar
              </button>
            </div>
          ) : (
            <div className="profile-footer-actions">
              <button className="profile-edit-btn" onClick={handleEdit}>
                Editar Perfil
              </button>
              <button className="profile-logout-btn" onClick={() => { logout(); navigate("/"); }}>
                Sair da Conta
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Perfil;