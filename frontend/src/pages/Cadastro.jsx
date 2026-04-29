import { useCallback, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';
import Button from '../components/Button';
import Input from '../components/Input';
import { apiRequest } from '../services/api';
import '../styles/pages/Auth.css';

const PASSWORD_RULES = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasNumber: /[0-9]/,
};

function getPasswordStrength(password) {
  if (!password) {
    return { level: 0, label: '' };
  }

  let score = 0;

  if (password.length >= PASSWORD_RULES.minLength) score++;
  if (PASSWORD_RULES.hasUppercase.test(password)) score++;
  if (PASSWORD_RULES.hasNumber.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 1) return { level: 1, label: 'Fraca', className: 'weak' };
  if (score === 2) return { level: 2, label: 'Media', className: 'medium' };
  if (score === 3) return { level: 3, label: 'Forte', className: 'strong' };
  return { level: 4, label: 'Muito forte', className: 'very-strong' };
}

function validateEmail(email) {
  if (!email) return '';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return 'Formato de email invalido';
  }

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
  const location = useLocation();
  const { isLoggedIn, login } = useAuth();
  const fromLocation = location.state?.from;
  const redirectTo =
    fromLocation?.pathname &&
    fromLocation.pathname !== '/login' &&
    fromLocation.pathname !== '/cadastro'
      ? `${fromLocation.pathname}${fromLocation.search || ''}`
      : '/explorar';

  const handleBlur = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const getFieldError = useCallback(
    (field) => {
      if (serverErrors[field]) return serverErrors[field];
      if (!touched[field]) return '';

      switch (field) {
        case 'name':
          if (!nome) return 'O nome e obrigatorio';
          if (nome.length < 2) return 'O nome deve ter no minimo 2 caracteres';
          if (nome.length > 120) return 'O nome deve ter no maximo 120 caracteres';
          return '';
        case 'email':
          if (!email) return 'O email e obrigatorio';
          return validateEmail(email);
        case 'password':
          if (!senha) return 'A senha e obrigatoria';
          if (senha.length < 8) return 'A senha deve ter no minimo 8 caracteres';
          if (!PASSWORD_RULES.hasUppercase.test(senha)) {
            return 'A senha deve conter ao menos uma letra maiuscula';
          }
          if (!PASSWORD_RULES.hasNumber.test(senha)) {
            return 'A senha deve conter ao menos um numero';
          }
          return '';
        case 'confirmPassword':
          if (!confirmaSenha) return 'Confirme sua senha';
          if (senha !== confirmaSenha) return 'As senhas nao coincidem';
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

  if (isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleCadastro = async (event) => {
    event.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isFormValid()) {
      return;
    }

    setErroGeral('');
    setServerErrors({});
    setCarregando(true);

    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: { name: nome, email, password: senha },
      });

      login(data);
      setSucesso(true);

      window.setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 800);
    } catch (err) {
      if (err.data?.errors) {
        setServerErrors(err.data.errors);
      }

      setErroGeral(err.message || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Alexandria</h1>
          <p>Criacao de conta</p>
        </header>

        {sucesso && (
          <AlertMessage
            type="success"
            title="Conta criada com sucesso!"
            message="Voce ja esta autenticado. Redirecionando..."
          />
        )}

        {erroGeral && !sucesso && (
          <AlertMessage type="error" title="Erro" message={erroGeral} />
        )}

        <form
          onSubmit={handleCadastro}
          className="auth-form"
          autoComplete="off"
          noValidate
        >
          <Input
            id="alexandria-signup-name"
            label="Nome completo"
            name="alexandria-signup-name"
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(event) => {
              setNome(event.target.value);
              setServerErrors((prev) => ({ ...prev, name: undefined }));
            }}
            onBlur={() => handleBlur('name')}
            state={getFieldState('name')}
            stateMessage={getFieldError('name')}
            autoComplete="off"
            required
          />

          <Input
            id="alexandria-signup-email"
            label="Email"
            name="alexandria-signup-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setServerErrors((prev) => ({ ...prev, email: undefined }));
            }}
            onBlur={() => handleBlur('email')}
            state={getFieldState('email')}
            stateMessage={getFieldError('email')}
            autoComplete="off"
            required
          />

          <div className="password-field-wrapper">
            <Input
              id="alexandria-signup-password"
              label="Senha"
              name="alexandria-signup-password"
              type="password"
              placeholder="********"
              value={senha}
              onChange={(event) => {
                setSenha(event.target.value);
                setServerErrors((prev) => ({ ...prev, password: undefined }));
              }}
              onBlur={() => handleBlur('password')}
              state={getFieldState('password')}
              stateMessage={getFieldError('password')}
              autoComplete="new-password"
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
            id="alexandria-signup-confirm-password"
            label="Confirmar senha"
            name="alexandria-signup-confirm-password"
            type="password"
            placeholder="********"
            value={confirmaSenha}
            onChange={(event) => setConfirmaSenha(event.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            state={getFieldState('confirmPassword')}
            stateMessage={getFieldError('confirmPassword')}
            autoComplete="new-password"
            required
          />

          <div className="auth-action">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={carregando || sucesso}
            >
              {carregando ? 'Cadastrando...' : sucesso ? 'Conta criada' : 'Cadastrar'}
            </Button>
          </div>
        </form>

        <footer className="auth-footer">
          <p>
            Ja possui uma conta? <Link to="/login">Entrar</Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Cadastro;
