import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { mensagemDeErro } from '../../services/api';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { entrar } = useAuth();
  // Para onde voltar depois do login (ex.: veio da tela de reservas)
  const voltarPara = location.state?.from || '/';

  // Estados do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      // A API grava a sessão num cookie HttpOnly e devolve só o perfil público.
      const { data: perfil } = await api.post('/api/login', { email, senha });
      setSenha('');
      entrar(perfil);

      // Admin vai pro painel; cliente volta para onde estava (ex.: reservas, convite).
      navigate(perfil.role === 'ADMIN' ? '/dashboard' : voltarPara, { replace: true });

    } catch (error) {
      if (error.response?.status === 401) {
        setErro('Email ou senha incorretos.');
      } else if (error.response?.status === 400) {
        setErro('Preencha e-mail e senha.');
      } else {
        setErro(mensagemDeErro(error));
      }
    }
  };

  return (
    <>
      <Header />
      <div className="login-container">
        <div className="login-left">
          <div className="login-overlay">
            <div className="brand-logo">BOTECO DO HUDSON</div>
            <div className="left-content">
              <span className="subtitle">BEM-VINDO AO BOTECO</span>
              <h1>A CASA<br /><span className="text-orange">É SUA.</span></h1>
              <p>Acompanhe suas reservas, garanta seus ingressos para os eventos e não fique de fora da nossa roda.</p>
            </div>
            <div className="left-footer">
              BELO HORIZONTE • DESDE 1975
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-box">
            <span className="subtitle">ÁREA DO CLIENTE</span>
            <h2>ACESSE SUA<br /><span className="text-orange">CONTA.</span></h2>
            <p className="description">Entre para gerenciar suas reservas e acompanhar nossos eventos.</p>

            {erro && <p style={{color: 'red', marginBottom: '15px'}}>{erro}</p>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>SEU EMAIL</label>
                <input 
                  type="email" 
                  placeholder="seuemail@exemplo.com" 
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>SENHA</label>
                <input 
                  type="password" 
                  placeholder="Digite sua senha" 
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-login">ENTRAR ➔</button>
            </form>

            <div className="login-footer">
              <Link to="/esqueci-senha">Esqueci a senha</Link>
              <Link to="/cadastro" state={location.state}>Não tem conta? Cadastre-se</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;