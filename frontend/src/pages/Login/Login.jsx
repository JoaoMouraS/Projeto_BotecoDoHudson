import React from 'react';

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
            <span className="subtitle">NOS BASTIDORES DA RODA</span>
            <h1>A CASA<br/><span className="text-orange">É SUA.</span></h1>
            <p>O painel para cuidar de cada mesa, cada evento e cada história que acontece por aqui.</p>
          </div>
          <div className="left-footer">
            CENTRO DO RIO • DESDE 2012
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="login-right">
        <div className="login-form-box">
          <span className="subtitle">ÁREA RESTRITA - EQUIPE BOTECO DO HUDSON</span>
          <h2>ENTRAR NO<br/><span className="text-orange">PAINEL.</span></h2>
          <p className="description">A gestão da casa começa por aqui.</p>

          <form>
            <div className="form-group">
              <label>EMAIL DA EQUIPE</label>
              <input type="email" placeholder="hudson@botecodohudson.com.br" />
            </div>

            <div className="form-group">
              <label>SENHA</label>
              <input type="password" placeholder="Digite sua senha" />
            </div>

            <button type="submit" className="btn-login">ENTRAR NO PAINEL ➔</button>
          </form>

          <div className="login-footer">
            <a href="#">Esqueci a senha</a>
            <span>🛡️ Acesso protegido</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;