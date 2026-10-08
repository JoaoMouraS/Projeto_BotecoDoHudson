import React, { useEffect, useState } from 'react';
import Header from "../../components/Header/Header";
import api from '../../services/api';
import './Eventos.css';

const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const nomesDias = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function chaveData(data) {
  return data.toISOString().slice(0, 10);
}

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [ingressos, setIngressos] = useState({});
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [mesCalendario, setMesCalendario] = useState(() => {
    const data = new Date();
    return new Date(data.getFullYear(), data.getMonth(), 1);
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.get('/api/eventos')
      .then(async ({ data }) => {
        setEventos(data);
        const entradas = await Promise.all(data.map(async (evento) => {
          const resposta = await api.get(`/api/eventos/${evento.id}/ingressos`);
          return [evento.id, resposta.data];
        }));
        setIngressos(Object.fromEntries(entradas));
      })
      .catch(() => setErro('Não foi possível carregar os eventos.'))
      .finally(() => setCarregando(false));
  }, []);

  const eventosOrdenados = [...eventos].sort((a, b) => new Date(a.dataEvento) - new Date(b.dataEvento));
  const eventoDestaque = eventosOrdenados[0];
  const agora = new Date();
  const hoje = chaveData(agora);
  const datasComEventos = new Set(eventosOrdenados.map((evento) => evento.dataEvento.slice(0, 10)));
  const eventosVisiveis = dataSelecionada
    ? eventosOrdenados.filter((evento) => evento.dataEvento.startsWith(dataSelecionada))
    : eventosOrdenados;

  const primeiroDia = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth(), 1);
  const ultimoDia = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() + 1, 0);
  const diasCalendario = Array.from({ length: primeiroDia.getDay() + ultimoDia.getDate() }, (_, index) => {
    if (index < primeiroDia.getDay()) return null;
    return new Date(mesCalendario.getFullYear(), mesCalendario.getMonth(), index - primeiroDia.getDay() + 1);
  });

  const mudarMes = (quantidade) => {
    const proximo = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() + quantidade, 1);
    const mesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
    if (proximo < mesAtual) return;
    setMesCalendario(proximo);
  };

  const selecionarData = (data) => {
    if (!data) return;
    const dataFormatada = chaveData(data);
    if (dataFormatada < hoje) return;
    if (!datasComEventos.has(dataFormatada)) {
      setErro('Não há evento publicado nessa data. Escolha uma data marcada na agenda.');
      return;
    }
    setErro('');
    setDataSelecionada(dataFormatada);
  };

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
          <div className="event-calendar">
            <div className="calendar-heading">
              <button type="button" aria-label="Mês anterior" onClick={() => mudarMes(-1)}>‹</button>
              <strong>{nomesMeses[mesCalendario.getMonth()].toUpperCase()} {mesCalendario.getFullYear()}</strong>
              <button type="button" aria-label="Próximo mês" onClick={() => mudarMes(1)}>›</button>
            </div>
            <div className="calendar-weekdays">
              {nomesDias.map((dia, index) => <span key={`${dia}-${index}`}>{dia}</span>)}
            </div>
            <div className="calendar-days">
              {diasCalendario.map((dia, index) => {
                if (!dia) return <span className="calendar-day calendar-day--empty" key={`empty-${index}`} />;
                const data = chaveData(dia);
                const passado = data < hoje;
                const temEvento = datasComEventos.has(data);
                const selecionada = data === dataSelecionada;
                return <button
                  type="button"
                  key={data}
                  className={`calendar-day ${passado ? 'calendar-day--past' : ''} ${temEvento ? 'calendar-day--event' : ''} ${selecionada ? 'calendar-day--selected' : ''}`}
                  disabled={passado || !temEvento}
                  onClick={() => selecionarData(dia)}
                >
                  {dia.getDate()}
                  {temEvento && <i aria-hidden="true" />}
                </button>;
              })}
            </div>
            <div className="calendar-footer">
              <span>{dataSelecionada ? `Eventos de ${new Date(`${dataSelecionada}T12:00:00`).toLocaleDateString('pt-BR')}` : 'Datas com evento disponíveis'}</span>
              {dataSelecionada && <button type="button" onClick={() => setDataSelecionada('')}>Ver todos</button>}
            </div>
          </div>
        </div>

        <div className="agenda-list">
          {carregando && <p>Carregando eventos...</p>}
          {erro && <p role="alert">{erro}</p>}
          {!carregando && !erro && eventos.length === 0 && <p>Nenhum evento futuro publicado.</p>}
          {eventosVisiveis.map((evento) => {
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
                {ingressos[evento.id]?.length > 0 && <div className="ticket-list">
                  {ingressos[evento.id].map((ticket) => <span className="ticket-chip" key={ticket.id}>{ticket.nome}: {Number(ticket.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} · {ticket.publicoAlvo.toLowerCase()} · {Math.max(ticket.quantidadeTotal - ticket.quantidadeVendida, 0)} disponíveis</span>)}
                </div>}
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