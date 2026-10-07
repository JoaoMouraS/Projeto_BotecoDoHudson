import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [reservas, setReservas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const { usuario } = useAuth();

  const carregarReservas = async () => {
    setCarregando(true);
    try {
      const { data } = await api.get('/api/reservas');
      setReservas(data);
    } catch {
      setErro('Não foi possível carregar as reservas.');
    } finally {
      setCarregando(false);
    }
    try {
      const eventosResponse = await api.get('/api/eventos/admin');
      setEventos(eventosResponse.data);
    } catch {
      setErro((atual) => atual || 'Não foi possível carregar os eventos.');
    }
  };

  useEffect(() => {
    carregarReservas();
  }, []);

  const alterarStatus = async (reserva, status) => {
    try {
      await api.put(`/api/reservas/${reserva.idReserva}`, { ...reserva, status });
      await carregarReservas();
    } catch {
      setErro('Não foi possível atualizar o status da reserva.');
    }
  };

  const excluirReserva = async (id) => {
    if (!window.confirm('Excluir esta reserva?')) return;

    try {
      await api.delete(`/api/reservas/${id}`);
      setReservas((atuais) => atuais.filter((reserva) => reserva.idReserva !== id));
    } catch {
      setErro('Não foi possível excluir a reserva.');
    }
  };

  const reservasHoje = reservas.filter((reserva) =>
    reserva.dataReserva?.startsWith(new Date().toISOString().slice(0, 10))
  ).length;

  return (
    <div className="dashboard-container">
      {/* Sidebar Lateral */}
      <aside className="sidebar">
        <div className="sidebar-logo">BOTECO DO HUDSON</div>
        <span className="sidebar-subtitle">OPERAÇÃO DA CASA</span>
        <nav className="sidebar-nav">
          <a href="#" className="active">Dashboard</a>
          <a href="#">Reservas <span className="badge">12</span></a>
          <Link to="/admin/eventos">Eventos</Link>
          <Link to="/admin/cardapio">Cardápio</Link>
          <a href="#">Galeria de Fotos</a>
          <a href="#">Configurações</a>
        </nav>
      </aside>

      {/* Área Principal */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="date">QUARTA-FEIRA, 18 DE JUNHO DE 2025</span>
            <h1>OLÁ, {usuario?.nome || 'ADMIN'}<span className="text-orange">.</span></h1>
          </div>
          <div className="user-profile">
            <div className="user-info">
              <strong>{usuario?.nome || 'Administrador'}</strong>
              <span>Administrador</span>
            </div>
            <div className="user-avatar">{usuario?.fotoUrl ? <img src={usuario.fotoUrl} alt="" /> : usuario?.nome?.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {/* Cards de Métricas */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-title">RESERVAS HOJE</span>
            <h3>{reservasHoje}</h3>
            <p>mesas confirmadas</p>
            <span className="stat-trend">+3 desde ontem</span>
          </div>
          <div className="stat-card">
            <span className="stat-title">INGRESSOS VENDIDOS</span>
            <h3>87 / 120</h3>
            <p>disponíveis</p>
            <span className="stat-trend text-orange">72,5% da capacidade</span>
          </div>
          <div className="stat-card">
            <span className="stat-title">FOTOS VENDIDAS</span>
            <h3>R$ 134,00</h3>
            <p>sem marca d'água</p>
            <span className="stat-trend text-orange">+R$ 28,00 esta semana</span>
          </div>
        </div>

        {/* Tabelas Inferiores (Simplificado) */}
        <div className="tables-grid">
          <div className="table-box">
            <div className="box-header">
              <h3>ÚLTIMAS RESERVAS</h3>
              <a href="#">VER TODAS &gt;</a>
            </div>
            {/* Estrutura da tabela entraria aqui */}
            {erro && <p className="dashboard-error" role="alert">{erro}</p>}
            {carregando ? <p className="placeholder-text">Carregando reservas...</p> : (
              <div className="reservas-admin-list">
                {reservas.length === 0 && <p className="placeholder-text">Nenhuma reserva cadastrada.</p>}
                {reservas.slice(0, 8).map((reserva) => (
                  <div className="reserva-admin-row" key={reserva.idReserva}>
                    <div>
                      <strong>{reserva.nomeCliente}</strong>
                      <span>{new Date(reserva.dataReserva).toLocaleString('pt-BR')} · {reserva.quantidadePessoas} pessoas</span>
                    </div>
                    <div className="reserva-admin-actions">
                      <select value={reserva.status || 'PENDENTE'} onChange={(event) => alterarStatus(reserva, event.target.value)}>
                        <option value="PENDENTE">Pendente</option>
                        <option value="CONFIRMADA">Confirmada</option>
                        <option value="RECUSADA">Recusada</option>
                        <option value="CANCELADA">Cancelada</option>
                        <option value="PRESENTE">Presente</option>
                        <option value="EXPIRADA">Expirada</option>
                      </select>
                      <button type="button" onClick={() => excluirReserva(reserva.idReserva)}>Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="table-box">
            <div className="box-header">
              <h3>PRÓXIMOS EVENTOS</h3>
            </div>
            {eventos.length === 0 && <p className="placeholder-text">Nenhum evento cadastrado.</p>}
            {eventos.slice(0, 5).map((evento) => (
              <div className="evento-admin-row" key={evento.id}>
                <strong>{evento.nome}</strong>
                <span>{new Date(evento.dataEvento).toLocaleString('pt-BR')} · {evento.local}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;