import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const Reservation = ({ currentPath, onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPath={currentPath} onNavigate={onNavigate} />
      <main className="flex-grow px-6 md:px-24 py-12">
        <p className="text-[#FF6B00] tracking-widest text-sm font-semibold mb-4 uppercase">Garanta sua mesa</p>
        <h1 className="text-5xl md:text-7xl font-heading font-bold uppercase mb-12">RESERVA SEM APERREIO.</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-3/5 border border-gray-800 p-8">
            <form className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-xs tracking-widest uppercase text-gray-400 font-semibold">Data</label>
                  <input type="date" className="bg-transparent border border-gray-700 p-4 text-white outline-none focus:border-[#FF6B00] transition" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-xs tracking-widest uppercase text-gray-400 font-semibold">Horário</label>
                  <select className="bg-transparent border border-gray-700 p-4 text-white outline-none focus:border-[#FF6B00] transition">
                    <option className="bg-[#1A110C]">19:00</option>
                    <option className="bg-[#1A110C]">20:00</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs tracking-widest uppercase text-gray-400 font-semibold">Nome do Responsável</label>
                <input type="text" placeholder="Como podemos te chamar?" className="bg-transparent border border-gray-700 p-4 text-white outline-none focus:border-[#FF6B00] transition" />
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-[2] flex flex-col gap-2">
                  <label className="text-xs tracking-widest uppercase text-gray-400 font-semibold">WhatsApp</label>
                  <input type="text" placeholder="(21) 99999-0000" className="bg-transparent border border-gray-700 p-4 text-white outline-none focus:border-[#FF6B00] transition" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-xs tracking-widest uppercase text-gray-400 font-semibold">Pessoas</label>
                  <input type="number" placeholder="6" className="bg-transparent border border-gray-700 p-4 text-white outline-none focus:border-[#FF6B00] transition" />
                </div>
              </div>

              <div className="border border-gray-700 p-4 flex items-center gap-4">
                <input type="checkbox" className="w-5 h-5 accent-[#FF6B00]" />
                <div>
                  <p className="font-bold text-sm uppercase tracking-wider">É Aniversário?</p>
                  <p className="text-xs text-gray-400">A gente prepara uma surpresa.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="bg-[#FF6B00] text-[#1A110C] font-bold uppercase tracking-wider text-sm px-8 py-4 w-full md:w-auto self-start mt-4 hover:bg-orange-600 transition"
              >
                Solicitar Reserva
              </button>
              {submitted && (
                <p className="text-sm text-[#FF6B00]">Reserva enviada! A equipe da casa entra em contato em breve.</p>
              )}
            </form>
          </div>

          <div className="lg:w-2/5 flex flex-col justify-between">
            <div className="border border-gray-800 p-8 bg-[#221711]">
              <p className="text-[#FF6B00] tracking-widest text-xs font-semibold mb-2 uppercase">Confirmação da Turma</p>
              <h2 className="text-4xl font-heading font-bold uppercase mb-4">6 DE 8 INGRESSOS</h2>

              <div className="w-full bg-gray-800 h-4 mb-4">
                <div className="bg-[#FF6B00] h-full" style={{ width: '75%' }}></div>
              </div>

              <p className="text-gray-400 text-sm mb-8">A mesa fica efetiva quando o mínimo de 8 pessoas comprar o ingresso.</p>

              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white p-2">
                  <div className="w-full h-full border-4 border-dashed border-gray-300"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-300 mb-1">Compartilhe com a roda</p>
                  <p className="text-[#FF6B00] font-mono text-sm mb-2">hudson.boteco/r/8k2p</p>
                  <button type="button" className="text-[#FF6B00] text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-white transition">
                    📋 Copiar Link
                  </button>
                </div>
              </div>
            </div>

            <div className="border-l-2 border-[#FF6B00] pl-4 mt-8">
              <p className="text-sm text-gray-400">Cancelamento grátis até 4 horas antes. A entrada é convertida em consumo na casa.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reservation;