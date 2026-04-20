import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import '../styles/pages/Auth.css';

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const navigate = useNavigate();

  const handleCadastro = (e) => {
    e.preventDefault();
    if (senha !== confirmaSenha) {
      alert('As senhas não coincidem!');
      return;
    }
    navigate('/explorar');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <header className="auth-header">
          <h1>Alexandria</h1>
          <p>Criação de Conta</p>
        </header>

        <form onSubmit={handleCadastro} className="auth-form">
          <Input 
            id="nome"
            label="Nome Completo"
            type="text" 
            placeholder="Seu nome" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

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

          <Input 
            id="confirmaSenha"
            label="Confirmar Senha"
            type="password" 
            placeholder="••••••••" 
            value={confirmaSenha}
            onChange={(e) => setConfirmaSenha(e.target.value)}
            required
          />

          <div className="auth-action">
            <Button type="submit" variant="primary" fullWidth>
             Cadastrar
            </Button>
          </div>
        </form>

        <footer className="auth-footer">
          <p>Já possui uma conta? <span onClick={() => navigate('/login')}>Entrar</span></p>
        </footer>
      </div>
    </div>
  );
};

export default Cadastro;