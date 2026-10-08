import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estados do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const response = await api.post('/api/login', {
        email,
        senha
      });

      // O backend devolve { token, role } — antes o código usava uma variável
      // "role" que nunca tinha sido criada, o que estourava um erro no meio
      // do processo e caía direto na mensagem "Erro no servidor".
      const { token, role } = response.data;

      // Salva o token/role e carrega os dados do usuário (usado no Header/Perfil)
      await login(token, role);

      // Regra de redirecionamento: só ADMIN vai pro dashboard
      if (role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }

    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErro('Email ou senha incorretos.');
      } else {
        setErro('Erro no servidor. Tente novamente mais tarde.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-overlay">
            <div className="brand-logo">🍺 <span>Boteco<br />do Hudson</span></div>
            <div className="left-content">
              <span className="subtitle">TRADIÇÃO, RESENHA E BOA COMPANHIA</span>
              <h1>A CASA<br /><span className="text-orange">É SUA.</span></h1>
              <p>Faça seu login ou cadastre-se para viver essa experiência com a gente.</p>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-box">
            <div className="auth-brand">🍺 <strong>Boteco <span>do Hudson</span></strong></div>
            <h2>BEM-VINDO<span className="text-orange">!</span></h2>
            <p className="description">Entre para gerenciar suas reservas e acompanhar nossos eventos.</p>

            {erro && <p style={{color: 'red', marginBottom: '15px'}}>{erro}</p>}

            <form onSubmit={handleLogin}>
              <div className="form-group auth-field">
                <label>EMAIL</label>
                <input 
                  type="email" 
                  placeholder="seuemail@exemplo.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group auth-field">
                <label>SENHA</label>
                <input 
                  type="password" 
                  placeholder="Digite sua senha" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-login" disabled={enviando}>
                {enviando ? 'ENTRANDO...' : 'ENTRAR  →'}
              </button>
            </form>

            <div className="login-footer">
              <Link to="/esqueci-senha">Esqueceu sua senha?</Link>
              <Link className="auth-outline-button" to="/cadastro">＋ &nbsp; Criar uma conta</Link>
            </div>
            <p className="auth-switch">Já tem uma conta? <Link to="/cadastro">Cadastre-se</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;