import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import './Perfil.css';

const Perfil = () => {
  const { usuario, carregando, isAutenticado, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (carregando) {
    return (
      <>
        <Header />
        <div className="perfil-container">
          <p>Carregando...</p>
        </div>
      </>
    );
  }

  if (!isAutenticado || !usuario) {
    return (
      <>
        <Header />
        <div className="perfil-container">
          <p>Você precisa estar logado para ver essa página.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="perfil-container">
        <span className="subtitle">ÁREA DO CLIENTE</span>
        <h1>MEU<br /><span className="text-orange">PERFIL.</span></h1>

        {/* Só exibe dados que o próprio usuário cadastrou — o backend nunca
            devolve a senha nessa rota, então não tem risco de vazamento aqui. */}
        <div className="perfil-info-box">
          <div className="perfil-avatar">
            {usuario.nome?.charAt(0).toUpperCase()}
          </div>

          <div className="perfil-dados">
            <div className="perfil-campo">
              <label>NOME</label>
              <p>{usuario.nome}</p>
            </div>
            <div className="perfil-campo">
              <label>EMAIL</label>
              <p>{usuario.email}</p>
            </div>
            <div className="perfil-campo">
              <label>TIPO DE CONTA</label>
              <p>{usuario.role === 'ADMIN' ? 'Administrador' : 'Cliente'}</p>
            </div>
          </div>
        </div>

        <button className="btn-login" onClick={handleLogout}>SAIR DA CONTA</button>
      </div>
    </>
  );
};

export default Perfil;