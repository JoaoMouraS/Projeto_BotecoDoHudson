import React, { useEffect, useState } from 'react';
import Header from "../../components/Header/Header";
import api from '../../services/api';
import './Eventos.css';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.get('/api/eventos')
      .then(({ data }) => setEventos(data))
      .catch(() => setErro('Não foi possível carregar os eventos.'))
      .finally(() => setCarregando(false));
  }, []);

  const eventoDestaque = eventos[0];

  return (
  <>
  <Header />


    <div className="eventos-container">
      {/* Hero Section */}
      <div className="eventos-hero">
        <div className="hero-content">
          <span className="subtitle">AGENDA DO BOTECO</span>
          <h1>{eventoDestaque?.nome || 'FEIJOADA E BATUQUE'}</h1>
          <p>{eventoDestaque?.descricao || 'Uma tarde inteira para cantar, comer e esquecer da hora.'}</p>
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
          {carregando && <p>Carregando eventos...</p>}
          {erro && <p role="alert">{erro}</p>}
          {!carregando && !erro && eventos.length === 0 && <p>Nenhum evento futuro publicado.</p>}
          {eventos.map((evento) => {
            const data = new Date(evento.dataEvento);
            const imagens = evento.imagensUrls?.length
              ? evento.imagensUrls
              : evento.imagemUrl
                ? [evento.imagemUrl]
                : [];
            return <div className="agenda-item" key={evento.id}>
              {imagens.length > 0 && <div className="agenda-images">
                {imagens.map((imagem, index) => <img className="agenda-image" key={imagem} src={imagem} alt={`Imagem ${index + 1} do evento ${evento.nome}`} />)}
              </div>}
              <div className="agenda-date"><span className="day">{data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span></div>
              <div className="agenda-info">
                <h3>{evento.nome}</h3>
                <p>{evento.descricao}</p>
                <div className="agenda-details"><span>🕒 {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span><span>📍 {evento.local}</span></div>
              </div>
              <div className="agenda-actions"><span className="price">{Number(evento.precoIngresso).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>{evento.symplaUrl && <a className="btn-primary" href={evento.symplaUrl} target="_blank" rel="noreferrer">COMPRAR INGRESSO</a>}<button className="btn-secondary" onClick={() => window.location.href = '/reservar'}>RESERVAR MESA</button></div>
            </div>;
          })}
        </div>
      </div>
    </div>
    </>

  );
};

export default Eventos;