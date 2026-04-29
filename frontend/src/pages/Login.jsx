import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import Input from '../components/Input';
import { apiRequest } from '../services/api';
import '../styles/pages/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, login } = useAuth();
  const fromLocation = location.state?.from;
  const redirectTo =
    fromLocation?.pathname &&
    fromLocation.pathname !== '/login' &&
    fromLocation.pathname !== '/cadastro'
      ? `${fromLocation.pathname}${fromLocation.search || ''}`
      : '/explorar';

  if (isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    setErro('');
    setSucesso(false);
    setCarregando(true);

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password: senha },
      });

      login(data);
      setSucesso(true);

      window.setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 800);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-page">
      {sucesso && (
        <AlertMessage
          type="success"
          title="Login realizado com sucesso!"
          message="Redirecionando para a area protegida..."
        />
      )}

      <div className="auth-card">
        <header className="auth-header">
          <h1>Alexandria</h1>
          <p>Autenticacao de acesso</p>
        </header>

        {erro && !sucesso && (
          <AlertMessage type="error" title="Falha no login" message={erro} />
        )}

        <form
          onSubmit={handleLogin}
          className="auth-form"
          autoComplete="off"
        >
          <Input
            id="alexandria-login-email"
            label="Email"
            name="alexandria-login-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="off"
            required
          />

          <Input
            id="alexandria-login-password"
            label="Senha"
            name="alexandria-login-password"
            type="password"
            placeholder="********"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            autoComplete="new-password"
            required
          />

          <div className="auth-helper">
            <Link to="/esqueci-senha">Esqueci minha senha</Link>
          </div>

          <div className="auth-action">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={carregando || sucesso}
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>

        <footer className="auth-footer">
          <p>
            Nao possui conta? <Link to="/cadastro">Cadastrar</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
