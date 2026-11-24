import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from "../../components/Header/Header";
import api from '../../services/api';
import './Eventos.css';

const fmt = (iso) => {
  const d = new Date(iso);
  return {
    dia: d.toLocaleDateString('pt-BR', { day: '2-digit' }),
    mes: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
    extenso: d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
    hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
};

/** Agenda do boteco: eventos do Sympla + cadastrados pelo admin. */
const Eventos = () => {
  const [eventos, setEventos] = useState(null);

  useEffect(() => {
    api.get('/api/eventos').then(({ data }) => setEventos(data)).catch(() => setEventos([]));
  }, []);

  const destaque = eventos?.[0];
  const resto = eventos?.slice(1) ?? [];

  return (
    <>
      <Header />
      <div className="eventos-container">
        {destaque ? (
          <section className="eventos-hero" style={destaque.imagemUrl ? { backgroundImage: `url(${destaque.imagemUrl})` } : undefined}>
            <div className="eventos-hero__sombra" />
            <div className="hero-content">
              <span className="subtitle">PRÓXIMO EVENTO · {fmt(destaque.dataInicio).extenso.toUpperCase()}</span>
              <h1>{destaque.nome}</h1>
              {destaque.descricao && <p>{destaque.descricao.slice(0, 180)}{destaque.descricao.length > 180 ? '…' : ''}</p>}
              <div className="eventos-hero__acoes">
                {destaque.reservasAbertas && <Link to={`/reservar?evento=${destaque.id}`} className="btn-primary">RESERVAR MESA</Link>}
                {destaque.url && <a href={destaque.url} target="_blank" rel="noopener noreferrer" className="btn-secundario">COMPRAR INGRESSO ↗</a>}
              </div>
            </div>
          </section>
        ) : (
          <section className="eventos-hero eventos-hero--vazio">
            <div className="hero-content">
              <span className="subtitle">AGENDA</span>
              <h1>{eventos === null ? 'CARREGANDO...' : 'AGENDA EM BREVE.'}</h1>
              {eventos?.length === 0 && (
                <p>Nenhum evento marcado agora. Quer comemorar? <Link to="/reservar">Reserve a casa para o seu grupo</Link>.</p>
              )}
            </div>
          </section>
        )}

        {resto.length > 0 && (
          <div className="agenda-section">
            <div className="agenda-header">
              <h2>ESCOLHE A RODA.</h2>
            </div>
            <div className="agenda-list">
              {resto.map((ev) => {
                const d = fmt(ev.dataInicio);
                return (
                  <div className="agenda-item" key={ev.id}>
                    <div className="agenda-date">
                      <span className="day">{d.dia}</span>
                      <span className="mes">{d.mes}</span>
                    </div>
                    <div className="agenda-info">
                      <h3>{ev.nome}</h3>
                      {ev.descricao && <p>{ev.descricao.slice(0, 140)}{ev.descricao.length > 140 ? '…' : ''}</p>}
                      <div className="agenda-details">
                        <span>🕒 {d.extenso} · {d.hora}</span>
                        <span>🪑 {ev.reservasAbertas ? `${ev.mesasDisponiveis} mesas disponíveis` : 'reservas encerradas'}</span>
                      </div>
                    </div>
                    <div className="agenda-actions">
                      {ev.url && <a href={ev.url} target="_blank" rel="noopener noreferrer" className="btn-primary">COMPRAR INGRESSO</a>}
                      {ev.reservasAbertas && <Link to={`/reservar?evento=${ev.id}`} className="btn-secondary">RESERVAR MESA</Link>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Eventos;
