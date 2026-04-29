import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import Input from '../components/Input';
import { apiRequest } from '../services/api';
import '../styles/pages/Profile.css';

function EditarPerfil() {
  const navigate = useNavigate();
  const { token, user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const avatarInitial = (name?.trim() || email?.trim() || '?').charAt(0).toUpperCase();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const profile = await apiRequest('/api/auth/profile', { token });
        if (!isMounted) return;
        setName(profile.name || '');
        setEmail(profile.email || '');
      } catch {
        if (!isMounted) return;
        setName(user?.name || '');
        setEmail(user?.email || '');
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiRequest('/api/auth/profile', {
        method: 'PUT',
        token,
        body: { name, email },
      });

      login(response);
      setSuccess('Perfil atualizado com sucesso.');

      window.setTimeout(() => {
        navigate('/perfil');
      }, 700);
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
            <span>{avatarInitial}</span>
          </div>
          <h1>Editar perfil</h1>
          <p>Atualize seus dados pessoais com seguranca.</p>
        </header>

        {error && <AlertMessage type="error" title="Nao foi possivel salvar" message={error} />}
        {success && <AlertMessage type="success" title="Tudo certo" message={success} />}

        <form className="profile-edit-form" onSubmit={handleSubmit}>
          <Input
            id="profile-name"
            label="Nome completo"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Input
            id="profile-email"
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <div className="profile-actions">
            <Button type="button" variant="secondary" onClick={() => navigate('/perfil')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || loadingProfile}>
              {loading ? 'Salvando...' : loadingProfile ? 'Carregando...' : 'Salvar alteracoes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarPerfil;
