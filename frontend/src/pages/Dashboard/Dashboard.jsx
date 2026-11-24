import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { mensagemDeErro } from '../../services/api';
import { formatarDataHora, mesmoDia } from '../../utils/formatar';
import { STATUS_LABEL } from '../../utils/convite';
import './Dashboard.css';

const ATIVAS = ['AGUARDANDO_CONVIDADOS', 'CONFIRMADA'];

const Dashboard = () => {
  const { usuario } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [erro, setErro] = useState('');
  const [novoEvento, setNovoEvento] = useState({ nome: '', dataInicio: '', imagemUrl: '', url: '', descricao: '' });
  const [msgEvento, setMsgEvento] = useState(null);

  const carregar = useCallback(() => {
    // Rotas só de ADMIN no backend: mesmo burlando a rota do front, a API responde 403.
    api.get('/api/reservas').then(({ data }) => setReservas(data))
      .catch((err) => setErro(mensagemDeErro(err, 'Não foi possível carregar as reservas.')));
    api.get('/api/eventos').then(({ data }) => setEventos(data)).catch(() => {});
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const checkIn = async (id) => {
    try {
      const { data } = await api.patch(`/api/reservas/${id}/check-in`);
      setReservas((l) => l.map((r) => (r.id === id ? data : r)));
    } catch (err) {
      setErro(mensagemDeErro(err));
    }
  };

  const criarEvento = async (e) => {
    e.preventDefault();
    setMsgEvento(null);
    try {
      await api.post('/api/eventos', {
        ...novoEvento,
        dataInicio: novoEvento.dataInicio.length === 16 ? `${novoEvento.dataInicio}:00` : novoEvento.dataInicio,
      });
      setNovoEvento({ nome: '', dataInicio: '', imagemUrl: '', url: '', descricao: '' });
      setMsgEvento({ ok: true, texto: 'Evento cadastrado.' });
      carregar();
    } catch (err) {
      setMsgEvento({ ok: false, texto: mensagemDeErro(err, 'Confira os campos (imagem e link precisam ser https).') });
    }
  };

  const removerEvento = async (ev) => {
    if (!window.confirm(`Tirar "${ev.nome}" do site? Reservas já feitas continuam.`)) return;
    await api.delete(`/api/eventos/${ev.id}`).catch(() => {});
    carregar();
  };

  const sincronizar = async () => {
    setMsgEvento(null);
    try {
      setEventos((await api.post('/api/eventos/sincronizar')).data);
      setMsgEvento({ ok: true, texto: 'Sincronizado com o Sympla (se o token estiver configurado).' });
    } catch (err) {
      setMsgEvento({ ok: false, texto: mensagemDeErro(err) });
    }
  };

  const ativas = reservas.filter((r) => ATIVAS.includes(r.status));
  const hoje = ativas.filter((r) => mesmoDia(r.dataReserva));
  const proximas = ativas
    .filter((r) => new Date(r.dataReserva) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.dataReserva) - new Date(b.dataReserva));
  const aguardando = proximas.filter((r) => r.status === 'AGUARDANDO_CONVIDADOS');
  const pessoasHoje = hoje.reduce((s, r) => s + r.confirmados, 0);

  const dataHoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">BOTECO DO HUDSON</div>
        <span className="sidebar-subtitle">OPERAÇÃO DA CASA</span>
        <nav className="sidebar-nav">
          <a href="#hoje" className="active">Hoje</a>
          <a href="#reservas">Reservas <span className="badge">{proximas.length}</span></a>
          <a href="#eventos">Eventos</a>
          <Link to="/">Ver o site</Link>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header" id="hoje">
          <div>
            <span className="date">{dataHoje}</span>
            <h1>OLÁ, {(usuario?.nome?.split(' ')[0] || 'Hudson').toUpperCase()}<span className="text-orange">.</span></h1>
          </div>
        </header>

        {erro && <p className="aviso aviso--erro">{erro}</p>}

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-title">RESERVAS HOJE</span>
            <h3>{hoje.length}</h3>
            <p>{hoje.filter((r) => r.checkIn).length} já chegaram</p>
            <span className="stat-trend">{pessoasHoje} pessoas confirmadas · mesa sem check-in é liberada às 20h</span>
          </div>
          <div className="stat-card">
            <span className="stat-title">AGUARDANDO A RODA</span>
            <h3>{aguardando.length}</h3>
            <p>reservas sem a meta mínima</p>
            <span className="stat-trend text-orange">{proximas.length - aguardando.length} já liberadas</span>
          </div>
          <div className="stat-card">
            <span className="stat-title">CASA EXCLUSIVA</span>
            <h3>{proximas.filter((r) => r.exclusiva).length}</h3>
            <p>pedidos de dia fechado</p>
            <span className="stat-trend text-orange">falar com o cliente pelo WhatsApp</span>
          </div>
        </div>

        <div className="table-box" id="reservas">
          <div className="box-header"><h3>PRÓXIMAS RESERVAS</h3></div>
          {proximas.length === 0 ? (
            <p className="placeholder-text">Nenhuma reserva futura.</p>
          ) : (
            <table className="reservas-tabela">
              <thead>
                <tr><th>Quando</th><th>Para</th><th>Cliente</th><th>WhatsApp</th><th>Confirmados</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {proximas.map((r) => (
                  <tr key={r.id}>
                    <td>{formatarDataHora(r.dataReserva)}</td>
                    <td>{r.evento?.nome || (r.exclusiva ? '🏠 Casa exclusiva' : '—')}</td>
                    <td>{r.nomeCliente}{r.aniversario ? ' 🎂' : ''}</td>
                    <td><a href={`https://wa.me/55${r.telefone}`} target="_blank" rel="noopener noreferrer">{r.telefone}</a></td>
                    <td>{r.confirmados}/{r.metaMinima} <small>({r.quantidadePessoas} lugares)</small></td>
                    <td className={`status-${r.status.toLowerCase()}`}>{STATUS_LABEL[r.status]}</td>
                    <td>
                      {r.checkIn ? <span className="checkin-ok">✓ chegou</span> : mesmoDia(r.dataReserva) && (
                        <button type="button" className="btn-checkin" onClick={() => checkIn(r.id)}>CHECK-IN</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="tables-grid" id="eventos">
          <div className="table-box">
            <div className="box-header">
              <h3>EVENTOS NO SITE</h3>
              <button type="button" className="btn-checkin" onClick={sincronizar}>SINCRONIZAR SYMPLA</button>
            </div>
            {eventos.length === 0 && <p className="placeholder-text">Nenhum evento futuro.</p>}
            <ul className="eventos-admin">
              {eventos.map((ev) => (
                <li key={ev.id}>
                  <div>
                    <strong>{ev.nome}</strong>
                    <small>{formatarDataHora(ev.dataInicio)} · {ev.fonte === 'SYMPLA' ? 'Sympla' : 'manual'} · {ev.mesasDisponiveis} mesas livres</small>
                  </div>
                  <button type="button" onClick={() => removerEvento(ev)} title="Tirar do site">×</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="table-box">
            <div className="box-header"><h3>CADASTRAR EVENTO</h3></div>
            <form className="evento-form" onSubmit={criarEvento}>
              <input placeholder="Nome do evento" required maxLength={200} value={novoEvento.nome}
                onChange={(e) => setNovoEvento({ ...novoEvento, nome: e.target.value })} />
              <input type="datetime-local" required value={novoEvento.dataInicio}
                onChange={(e) => setNovoEvento({ ...novoEvento, dataInicio: e.target.value })} />
              <input type="url" placeholder="Imagem (https://...)" maxLength={500} value={novoEvento.imagemUrl}
                onChange={(e) => setNovoEvento({ ...novoEvento, imagemUrl: e.target.value })} />
              <input type="url" placeholder="Link de ingressos (opcional)" maxLength={500} value={novoEvento.url}
                onChange={(e) => setNovoEvento({ ...novoEvento, url: e.target.value })} />
              <textarea rows={3} placeholder="Descrição (opcional)" maxLength={2000} value={novoEvento.descricao}
                onChange={(e) => setNovoEvento({ ...novoEvento, descricao: e.target.value })} />
              {msgEvento && <p className={`aviso ${msgEvento.ok ? 'aviso--ok' : 'aviso--erro'}`}>{msgEvento.texto}</p>}
              <button className="btn-submit">CADASTRAR</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
