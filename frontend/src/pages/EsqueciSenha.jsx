import { useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import Input from '../components/Input';
import { apiRequest } from '../services/api';
import '../styles/pages/Auth.css';

function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });
      setResult(response);
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
          <h1>Recuperar acesso</h1>
          <p>Informe seu email para receber o link de redefinição.</p>
        </header>

        {error && <AlertMessage type="error" title="Falha na solicitação" message={error} />}
        {result && <AlertMessage type="success" title="Solicitação concluída" message={result.message} />}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="forgot-email"
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <div className="auth-action">
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Gerando link...' : 'Gerar link de redefinição'}
            </Button>
          </div>
        </form>

        {result?.resetUrl && (
          <div className="auth-demo-box">
            <strong>Link de redefinição gerado</strong>
            <p>Clique abaixo para abrir a página de redefinição de senha.</p>
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = result.resetUrl;
              }}
            >
              Ir para redefinir senha
            </Button>
          </div>
        )}

        <footer className="auth-footer auth-footer--stacked">
          <p>
            Lembrou sua senha? <Link to="/login">Voltar para o login</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default EsqueciSenha;
