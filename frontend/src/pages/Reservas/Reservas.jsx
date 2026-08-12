import React from 'react';
import Header from "../../components/Header/Header";
import './Reservas.css';

const Reservas = () => {
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
          <form>
            <div className="form-row">
              <div className="form-group">
                <label>DATA</label>
                <input type="date" placeholder="dd/mm/yyyy" />
              </div>
              <div className="form-group">
                <label>HORÁRIO</label>
                <select>
                  <option>19:00</option>
                  <option>20:00</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>NOME DO RESPONSÁVEL</label>
              <input type="text" placeholder="Como podemos te chamar?" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>WHATSAPP</label>
                <input type="text" placeholder="(21) 99999-0000" />
              </div>
              <div className="form-group">
                <label>PESSOAS</label>
                <input type="number" defaultValue="6" />
              </div>
            </div>

            <div className="form-checkbox">
              <input type="checkbox" id="aniversario" />
              <label htmlFor="aniversario">
                <strong>É ANIVERSÁRIO?</strong>
                <span>A GENTE PREPARA UMA SURPRESA.</span>
              </label>
            </div>

            <button type="submit" className="btn-submit">SOLICITAR RESERVA</button>
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