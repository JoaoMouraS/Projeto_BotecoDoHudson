import React from 'react';
import Header from '../../components/Header/Header';
import './Cadastro.css'; // Pode reaproveitar bastante do Login.css se preferir

const Cadastro = () => {
  return (
<>

  <Header />

    <div className="login-container">
      <div className="login-left">
        <div className="login-overlay">
          <div className="brand-logo">BOTECO DO HUDSON</div>
          <div className="left-content">
            <span className="subtitle">JUNTE-SE À EQUIPE</span>
            <h1>FAÇA PARTE<br/><span className="text-orange">DA RODA.</span></h1>
            <p>Cadastre-se para gerenciar reservas, eventos e a operação diária do boteco.</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-box">
          <span className="subtitle">CRIAR CONTA</span>
          <h2>NOVO<br/><span className="text-orange">USUÁRIO.</span></h2>

          <form>
            <div className="form-group">
              <label>NOME COMPLETO</label>
              <input type="text" placeholder="Digite seu nome" />
            </div>

            <div className="form-group">
              <label>EMAIL</label>
              <input type="email" placeholder="email@botecodohudson.com.br" />
            </div>

            <div className="form-group">
              <label>SENHA</label>
              <input type="password" placeholder="Crie uma senha forte" />
            </div>

            <button type="submit" className="btn-login">CADASTRAR ➔</button>
          </form>

          <div className="login-footer">
            <a href="/login">Já tem conta? Faça login</a>
          </div>
        </div>
      </div>
    </div>

    </>
  );
};

export default Cadastro;