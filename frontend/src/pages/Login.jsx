import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import "../styles/pages/Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: senha }),
      });

      if (!response.ok) {
        throw new Error("Email ou senha inválidos");
      }

      const data = await response.json();
      
      // Salvar token e dados do usuário
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userName", data.name);

      navigate("/explorar");
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
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

          {erro && (
            <div style={{ color: "#ff6b6b", fontSize: "0.9rem" }}>
              {erro}
            </div>
          )}

          <div className="auth-action">
            <Button type="submit" variant="primary" fullWidth disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </form>

        <footer className="auth-footer">
          <p>Não possui Conta? <span onClick={() => navigate("/cadastro")}>Cadastrar</span></p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
