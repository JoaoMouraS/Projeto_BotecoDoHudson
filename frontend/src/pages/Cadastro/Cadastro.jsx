import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './Cadastro.css'; 

const Cadastro = () => {
  return (
    <>
      <Header />

      <div className="login-container">
        <div className="login-left">
          <div className="login-overlay">
            <div className="left-content">
              <span className="subtitle">BEM-VINDO AO BOTECO</span>
              <h1>FAÇA PARTE<br /><span className="text-orange">DA RODA.</span></h1>
              <p>Cadastre-se para fazer suas reservas, garantir ingressos para os eventos e não ficar de fora do nosso samba.</p>
          </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-box">
            <span className="subtitle">ÁREA DO CLIENTE</span>
            <h2>NOVA<br /><span className="text-orange">CONTA.</span></h2>

            <form>
              <div className="form-group">
                <label>NOME COMPLETO</label>
                <input type="text" placeholder="Digite seu nome" />
              </div>

              <div className="form-group">
                <label>EMAIL</label>
                <input type="email" placeholder="seuemail@exemplo.com" />
              </div>

              <div className="form-group">
                <label>SENHA</label>
                <input type="password" placeholder="Crie uma senha forte" />
              </div>

              <button type="submit" className="btn-login">CADASTRAR ➔</button>
            </form>

            <div className="login-footer">
              <Link to="/login">Já tem conta? Faça login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cadastro;