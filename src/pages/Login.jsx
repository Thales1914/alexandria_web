import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import '../styles/pages/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/explorar');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Alexandria</h1>
          <p>Autenticação de Acesso</p>
        </header>

        <form onSubmit={handleLogin} className="auth-form">
          <Input 
            id="email"
            label="Email"
            type="email" 
            placeholder="seu@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input 
            id="senha"
            label="Senha"
            type="password" 
            placeholder="••••••••" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <div className="auth-action">
            <Button type="submit" variant="primary" fullWidth>
             Entrar
            </Button>
          </div>
        </form>

        <footer className="auth-footer">
          <p>Não possui Conta? <span onClick={() => navigate('/cadastro')}>Cadastrar</span></p>
        </footer>
      </div>
    </div>
  );
};

export default Login;