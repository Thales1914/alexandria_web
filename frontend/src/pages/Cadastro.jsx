import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import AlertMessage from '../components/AlertMessage';
import '../styles/pages/Auth.css';

const PASSWORD_RULES = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasNumber: /[0-9]/,
};

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '' };

  let score = 0;
  if (password.length >= PASSWORD_RULES.minLength) score++;
  if (PASSWORD_RULES.hasUppercase.test(password)) score++;
  if (PASSWORD_RULES.hasNumber.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 1) return { level: 1, label: 'Fraca', className: 'weak' };
  if (score === 2) return { level: 2, label: 'Média', className: 'medium' };
  if (score === 3) return { level: 3, label: 'Forte', className: 'strong' };
  return { level: 4, label: 'Muito forte', className: 'very-strong' };
}

function validateEmail(email) {
  if (!email) return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Formato de email inválido';
  return '';
}

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [erroGeral, setErroGeral] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const navigate = useNavigate();

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // --- Field-level validation ---
  const getFieldError = useCallback(
    (field) => {
      if (serverErrors[field]) return serverErrors[field];
      if (!touched[field]) return '';

      switch (field) {
        case 'name':
          if (!nome) return 'O nome é obrigatório';
          if (nome.length < 2) return 'O nome deve ter no mínimo 2 caracteres';
          if (nome.length > 120) return 'O nome deve ter no máximo 120 caracteres';
          return '';
        case 'email':
          if (!email) return 'O email é obrigatório';
          return validateEmail(email);
        case 'password':
          if (!senha) return 'A senha é obrigatória';
          if (senha.length < 8) return 'A senha deve ter no mínimo 8 caracteres';
          if (!PASSWORD_RULES.hasUppercase.test(senha))
            return 'A senha deve conter ao menos uma letra maiúscula';
          if (!PASSWORD_RULES.hasNumber.test(senha))
            return 'A senha deve conter ao menos um número';
          return '';
        case 'confirmPassword':
          if (!confirmaSenha) return 'Confirme sua senha';
          if (senha !== confirmaSenha) return 'As senhas não coincidem';
          return '';
        default:
          return '';
      }
    },
    [nome, email, senha, confirmaSenha, touched, serverErrors]
  );

  const getFieldState = useCallback(
    (field) => {
      const error = getFieldError(field);
      if (error) return 'error';
      if (!touched[field]) return 'default';
      return 'success';
    },
    [getFieldError, touched]
  );

  const isFormValid = useCallback(() => {
    return (
      nome.length >= 2 &&
      !validateEmail(email) &&
      email.length > 0 &&
      senha.length >= 8 &&
      PASSWORD_RULES.hasUppercase.test(senha) &&
      PASSWORD_RULES.hasNumber.test(senha) &&
      senha === confirmaSenha
    );
  }, [nome, email, senha, confirmaSenha]);

  const passwordStrength = getPasswordStrength(senha);

  const handleCadastro = async (e) => {
    e.preventDefault();

    // Touch all fields to show any remaining errors
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!isFormValid()) {
      return;
    }

    setErroGeral('');
    setServerErrors({});
    setCarregando(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: nome, email, password: senha }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        if (errorData?.errors) {
          setServerErrors(errorData.errors);
        }

        setErroGeral(errorData?.message || 'Erro ao cadastrar. Tente novamente.');
        return;
      }

      setSucesso(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setErroGeral('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-page">
      {sucesso && (
        <AlertMessage
          type="success"
          title="Conta criada com sucesso!"
          message="Agora você pode fazer o login para acessar sua biblioteca."
        />
      )}

      <div className="auth-card">
        <header className="auth-header">
          <h1>Alexandria</h1>
          <p>Criação de Conta</p>
        </header>

        {sucesso && (
          <AlertMessage
            type="success"
            title="Conta criada com sucesso!"
            message="Redirecionando..."
          />
        )}

        {erroGeral && !sucesso && (
          <AlertMessage type="error" title="Erro" message={erroGeral} />
        )}

        <form onSubmit={handleCadastro} className="auth-form" noValidate>
          <Input
            id="nome"
            label="Nome Completo"
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setServerErrors((prev) => ({ ...prev, name: undefined }));
            }}
            onBlur={() => handleBlur('name')}
            state={getFieldState('name')}
            stateMessage={getFieldError('name')}
            required
          />

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setServerErrors((prev) => ({ ...prev, email: undefined }));
            }}
            onBlur={() => handleBlur('email')}
            state={getFieldState('email')}
            stateMessage={getFieldError('email')}
            required
          />

          <div className="password-field-wrapper">
            <Input
              id="senha"
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setServerErrors((prev) => ({ ...prev, password: undefined }));
              }}
              onBlur={() => handleBlur('password')}
              state={getFieldState('password')}
              stateMessage={getFieldError('password')}
              required
            />
            {senha && (
              <div className="password-strength">
                <div className="password-strength__track">
                  <div
                    className={`password-strength__bar password-strength__bar--${passwordStrength.className}`}
                    style={{ width: `${(passwordStrength.level / 4) * 100}%` }}
                  />
                </div>
                <span
                  className={`password-strength__label password-strength__label--${passwordStrength.className}`}
                >
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <Input
            id="confirmaSenha"
            label="Confirmar Senha"
            type="password"
            placeholder="••••••••"
            value={confirmaSenha}
            onChange={(e) => setConfirmaSenha(e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            state={getFieldState('confirmPassword')}
            stateMessage={getFieldError('confirmPassword')}
            required
          />

          <div className="auth-action">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={carregando || sucesso}
            >
              {carregando ? 'Cadastrando...' : sucesso ? 'Conta criada ✓' : 'Cadastrar'}
            </Button>
          </div>
        </form>

        <footer className="auth-footer">
          <p>
            Já possui uma conta? <Link to="/login">Entrar</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Cadastro;
