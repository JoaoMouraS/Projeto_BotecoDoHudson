import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { uploadPublicImage } from '../../services/supabase';
import './Perfil.css';

const Perfil = () => {
  const { usuario, carregando, isAutenticado, logout, atualizarUsuario } = useAuth();
  const [nome, setNome] = useState('');
  const [foto, setFoto] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const salvarPerfil = async (event) => {
    event.preventDefault();
    setSalvando(true);
    setErro('');
    setMensagem('');
    try {
      const fotoUrl = foto ? await uploadPublicImage('profile-images', foto, `profiles/${usuario.id}`) : usuario.fotoUrl;
      const { data } = await api.put('/api/usuarios/me', { nome: nome || usuario.nome, fotoUrl });
      atualizarUsuario(data);
      setNome(data.nome);
      setFoto(null);
      setMensagem('Perfil atualizado com sucesso.');
    } catch (requestError) {
      setErro(requestError.response?.data?.message || 'Não foi possível atualizar o perfil.');
    } finally {
      setSalvando(false);
    }
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
            {usuario.fotoUrl ? <img src={usuario.fotoUrl} alt="Foto do perfil" /> : usuario.nome?.charAt(0).toUpperCase()}
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

        <form className="perfil-edicao" onSubmit={salvarPerfil}>
          <label>Nome<input value={nome || usuario.nome} onChange={(event) => setNome(event.target.value)} required /></label>
          <label>Foto do perfil<input type="file" accept="image/*" onChange={(event) => setFoto(event.target.files?.[0] || null)} /></label>
          {erro && <p role="alert" className="perfil-erro">{erro}</p>}
          {mensagem && <p role="status" className="perfil-sucesso">{mensagem}</p>}
          <button className="btn-login" type="submit" disabled={salvando}>{salvando ? 'SALVANDO...' : 'SALVAR PERFIL'}</button>
        </form>

        <button className="btn-login" onClick={handleLogout}>SAIR DA CONTA</button>
      </div>
    </>
  );
};

export default Perfil;