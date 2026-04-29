import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import Input from '../components/Input';
import { apiRequest } from '../services/api';
import '../styles/pages/Auth.css';

function RedefinirSenha() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') || '';
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const hasTokenFromUrl = useMemo(() => Boolean(initialToken), [initialToken]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: { token, password, confirmPassword },
      });

      setSuccessMessage(response.message);

      window.setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Redefinir senha</h1>
          <p>Defina uma nova senha para voltar ao Alexandria.</p>
        </header>

        {error && <AlertMessage type="error" title="Nao foi possivel redefinir" message={error} />}
        {successMessage && (
          <AlertMessage
            type="success"
            title="Senha atualizada!"
            message={`${successMessage} Redirecionando para o login...`}
          />
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="reset-token"
            label="Token de redefinicao"
            type="text"
            placeholder="Cole aqui o token gerado"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            required
          />

          <Input
            id="reset-password"
            label="Nova senha"
            type="password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Input
            id="reset-password-confirm"
            label="Confirmar nova senha"
            type="password"
            placeholder="********"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          <div className="auth-action">
            <Button type="submit" fullWidth disabled={loading || !token}>
              {loading ? 'Atualizando senha...' : 'Salvar nova senha'}
            </Button>
          </div>
        </form>

        {hasTokenFromUrl && (
          <div className="auth-demo-box">
            <strong>Link de redefinicao reconhecido</strong>
            <p>O token da URL ja foi preenchido automaticamente para voce.</p>
          </div>
        )}

        <footer className="auth-footer auth-footer--stacked">
          <p>
            Voltar para <Link to="/login">Entrar</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default RedefinirSenha;
