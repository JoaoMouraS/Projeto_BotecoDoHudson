import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header/Header';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  // Estados do formulário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      // Ajuste a URL se no seu controller estiver /api/v1/auth/login
      const response = await axios.post('http://localhost:8080/api/login', {
        email,
        senha
      });

      // Se deu certo, pega o token da resposta
      const token = response.data.token;
      
      // Salva o token no LocalStorage do navegador
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      // Redireciona o usuário para o Dashboard ou Home
      navigate('/eventos');

// Regra de redirecionamento:
      if (role === 'ADMIN') {
        navigate('/dashboard'); // Admin vai pro painel
      } else {
        navigate('/'); // Usuário comum vai pra página inicial
      }


    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErro('Email ou senha incorretos.');
      } else {
        setErro('Erro no servidor. Tente novamente mais tarde.');
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
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-login">ENTRAR ➔</button>
            </form>

            <div className="login-footer">
              <Link to="/esqueci-senha">Esqueci a senha</Link>
              <Link to="/cadastro">Não tem conta? Cadastre-se</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;