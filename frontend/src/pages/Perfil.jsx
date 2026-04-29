import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import { apiRequest } from '../services/api';
import '../styles/pages/Profile.css';

const PROFILE_FIELDS = [
  { label: 'Nome completo', key: 'name' },
  { label: 'Email de acesso', key: 'email' },
];

const Perfil = () => {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const avatarInitial = (profile?.name?.trim() || profile?.email?.trim() || '?')
    .charAt(0)
    .toUpperCase();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const response = await apiRequest('/api/auth/profile', { token });
        if (isMounted) {
          setProfile(response);
          setError('');
        }
      } catch {
        if (isMounted) {
          setProfile(user);
          setError('Nao foi possivel sincronizar o perfil agora. Exibindo os dados da sessao local.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token, user]);

  return (
    <div className="profile-page">
      <div className="profile-card">
        <header className="profile-header">
          <div className="profile-avatar-large">
            <span>{avatarInitial}</span>
          </div>
          <h1>Meu perfil</h1>
          <p>Visualize os dados da conta e avance para a edicao quando precisar.</p>
        </header>

        {error && <AlertMessage type="error" title="Sincronizacao parcial" message={error} />}

        <div className="profile-info">
          {PROFILE_FIELDS.map((field) => (
            <div key={field.key} className="profile-field">
              <label>{field.label}</label>
              <div className="profile-field-value">
                {loading ? 'Carregando...' : profile?.[field.key] || 'Nao informado'}
              </div>
            </div>
          ))}

          <div className="profile-field">
            <label>Status da conta</label>
            <div className="profile-field-value">Conta ativa</div>
          </div>
        </div>

        <footer className="profile-footer">
          <div className="profile-actions">
            <Button variant="secondary" onClick={() => navigate('/perfil/editar')}>
              Editar perfil
            </Button>
            <button
              className="profile-logout-btn"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Sair da conta
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Perfil;
