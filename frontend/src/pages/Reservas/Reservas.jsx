import React, { useEffect, useState } from 'react';
import Header from "../../components/Header/Header";
import api from '../../services/api';
import './Reservas.css';

const Reservas = () => {
  const [formulario, setFormulario] = useState({
    nomeCliente: '',
    quantidadePessoas: 2,
    dataReserva: '',
    horarioReserva: '',
  });
  const [eventos, setEventos] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    api.get('/api/eventos')
      .then(({ data }) => setEventos(data))
      .catch(() => setErro('Não foi possível carregar os dias de evento.'));
  }, []);

  const eventosDoDia = eventos.filter((evento) => evento.dataEvento.startsWith(formulario.dataReserva));
  const horariosDisponiveis = eventosDoDia.map((evento) => evento.dataEvento.slice(11, 16));

  const atualizarCampo = (event) => {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  };

  const solicitarReserva = async (event) => {
    event.preventDefault();
    setMensagem('');
    setErro('');
    setEnviando(true);

    try {
      await api.post('/api/reservas', {
        ...formulario,
        quantidadePessoas: Number(formulario.quantidadePessoas),
        dataReserva: `${formulario.dataReserva}T${formulario.horarioReserva}`,
      });
      setMensagem('Reserva solicitada com sucesso. Aguarde a confirmação da casa.');
      setFormulario({ nomeCliente: '', quantidadePessoas: 2, dataReserva: '', horarioReserva: '' });
    } catch (requestError) {
      setErro(requestError.response?.data?.message || requestError.response?.data || 'Não foi possível criar a reserva.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>

  <Header />
    <div className="reservas-container">
      <div className="reservas-header">
        <span className="subtitle">GARANTA SUA MESA</span>
        <h1>RESERVA SEM APERREIO.</h1>
      </div>

      <div className="reservas-content">
        {/* Formulário */}
        <div className="reservas-form-box">
          <form onSubmit={solicitarReserva}>
            <div className="form-row">
              <div className="form-group">
                <label>DATA</label>
                <select name="dataReserva" value={formulario.dataReserva} onChange={(event) => setFormulario((atual) => ({ ...atual, dataReserva: event.target.value, horarioReserva: '' }))} required>
                  <option value="">Selecione um dia com evento</option>
                  {[...new Set(eventos.map((evento) => evento.dataEvento.slice(0, 10)))].map((dia) => (
                    <option key={dia} value={dia}>{new Date(`${dia}T12:00:00`).toLocaleDateString('pt-BR')}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>HORÁRIO</label>
                <select name="horarioReserva" value={formulario.horarioReserva} onChange={atualizarCampo} required disabled={!formulario.dataReserva}>
                  <option value="">Selecione um horário</option>
                  {horariosDisponiveis.map((horario) => <option key={horario} value={horario}>{horario}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>NOME DO RESPONSÁVEL</label>
              <input type="text" name="nomeCliente" placeholder="Como podemos te chamar?" value={formulario.nomeCliente} onChange={atualizarCampo} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>WHATSAPP</label>
                <input type="text" placeholder="(21) 99999-0000" />
              </div>
              <div className="form-group">
                <label>PESSOAS</label>
                <input type="number" name="quantidadePessoas" min="2" value={formulario.quantidadePessoas} onChange={atualizarCampo} required />
              </div>
            </div>

            <div className="form-checkbox">
              <input type="checkbox" id="aniversario" />
              <label htmlFor="aniversario">
                <strong>É ANIVERSÁRIO?</strong>
                <span>A GENTE PREPARA UMA SURPRESA.</span>
              </label>
            </div>

            {erro && <p role="alert" className="reserva-erro">{erro}</p>}
            {mensagem && <p role="status" className="reserva-sucesso">{mensagem}</p>}
            <button type="submit" className="btn-submit" disabled={enviando}>
              {enviando ? 'ENVIANDO...' : 'SOLICITAR RESERVA'}
            </button>
          </form>
        </div>

        {/* Confirmação e QR Code */}
        <div className="reservas-info-box">
          <span className="subtitle">CONFIRMAÇÃO DA TURMA</span>
          <h2>6 DE 8 INGRESSOS</h2>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '75%' }}></div>
          </div>
          <p>A mesa fica efetiva quando o mínimo de 8 pessoas comprar o ingresso.</p>
          
          <div className="qr-box">
            <div className="qr-placeholder">QR</div>
            <div className="qr-link">
              <p>Compartilhe com a roda</p>
              <span>hudson.boteco/r/8k2p</span>
              <button>COPIAR LINK</button>
            </div>
          </div>

          <div className="cancel-policy">
            <p>Cancelamento grátis até 4 horas antes. A entrada é convertida em consumo na casa.</p>
          </div>
        </div>
      </div>
    </div>

    </>


  );
};

export default Reservas;