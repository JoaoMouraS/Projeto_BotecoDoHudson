import React from 'react';
import Header from "../../components/Header/Header";
import './Eventos.css';

const Eventos = () => {
  return (
  <>
  <Header />


    <div className="eventos-container">
      {/* Hero Section */}
      <div className="eventos-hero">
        <div className="hero-content">
          <span className="subtitle">EVENTO ESPECIAL • 22 DE JUNHO</span>
          <h1>FEIJOADA<br/>E BATUQUE</h1>
          <p>Uma tarde inteira para cantar, comer e esquecer da hora.</p>
        </div>
      </div>

      {/* Agenda Section */}
      <div className="agenda-section">
        <div className="agenda-header">
          <h2>ESCOLHE A RODA.</h2>
          <select className="mes-select">
            <option>JUNHO 2024</option>
            <option>JULHO 2024</option>
          </select>
        </div>

        <div className="agenda-list">
          <div className="agenda-item">
            <div className="agenda-date">
              <span className="day">18 JUN</span>
            </div>
            <div className="agenda-info">
              <h3>PAGODE DO HUDSON</h3>
              <p>Grupo Fundo de Quintal + convidados</p>
              <div className="agenda-details">
                <span>🕒 A PARTIR DAS 20H</span>
                <span>📍 BOTECO DO HUDSON</span>
              </div>
            </div>
            <div className="agenda-actions">
              <span className="price">R$ 35</span>
              <button className="btn-primary">COMPRAR INGRESSO</button>
              <button className="btn-secondary">RESERVAR MESA</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>

  );
};

export default Eventos;