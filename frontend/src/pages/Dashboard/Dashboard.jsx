import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar Lateral */}
      <aside className="sidebar">
        <div className="sidebar-logo">BOTECO DO HUDSON</div>
        <span className="sidebar-subtitle">OPERAÇÃO DA CASA</span>
        <nav className="sidebar-nav">
          <a href="#" className="active">Dashboard</a>
          <a href="#">Reservas <span className="badge">12</span></a>
          <a href="#">Eventos</a>
          <a href="#">Cardápio</a>
          <a href="#">Galeria de Fotos</a>
          <a href="#">Funcionários</a>
          <a href="#">Configurações</a>
        </nav>
      </aside>

      {/* Área Principal */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="date">QUARTA-FEIRA, 18 DE JUNHO DE 2025</span>
            <h1>OLÁ, HUDSON<span className="text-orange">.</span></h1>
          </div>
          <div className="user-profile">
            <div className="user-info">
              <strong>Hudson Almeida</strong>
              <span>Administrador</span>
            </div>
            <div className="user-avatar">H</div>
          </div>
        </header>

        {/* Cards de Métricas */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-title">RESERVAS HOJE</span>
            <h3>12</h3>
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
            <p className="placeholder-text">Listagem de clientes e status...</p>
          </div>
          <div className="table-box">
            <div className="box-header">
              <h3>PRÓXIMOS EVENTOS</h3>
            </div>
            {/* Estrutura da agenda entraria aqui */}
            <p className="placeholder-text">Listagem de eventos e ingressos...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;