import React from 'react';
import { Link } from 'react-router-dom'; // Importando o Link
import Header from '../../components/Header/Header';
import './Login.css';

const Login = () => {
  return (
    <>
      <Header />

      <div className="login-container">
        {/* Lado Esquerdo - Imagem/Texto */}
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

        {/* Lado Direito - Formulário */}
        <div className="login-right">
          <div className="login-form-box">
            <span className="subtitle">ÁREA DO CLIENTE</span>
            <h2>ACESSE SUA<br /><span className="text-orange">CONTA.</span></h2>
            <p className="description">Entre para gerenciar suas reservas e acompanhar nossos eventos.</p>

            <form>
              <div className="form-group">
                <label>SEU EMAIL</label>
                <input type="email" placeholder="seuemail@exemplo.com" />
              </div>

              <div className="form-group">
                <label>SENHA</label>
                <input type="password" placeholder="Digite sua senha" />
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