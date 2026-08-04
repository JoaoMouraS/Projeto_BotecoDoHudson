import React from 'react';
import Navbar from '../components/Navbar';

const Events = ({ currentPath, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPath={currentPath} onNavigate={onNavigate} />
      <main className="flex-grow px-6 md:px-24 py-12">
        <div className="mb-20">
          <p className="text-[#FF6B00] tracking-widest text-sm font-semibold mb-4 uppercase">Evento Especial • 22 de Junho</p>
          <h1 className="text-7xl md:text-[120px] font-heading font-bold leading-[0.85] text-[#FF6B00] uppercase mb-6">
            <span className="block text-white">FEIJOADA</span> E BATUQUE
          </h1>
          <p className="text-gray-400 text-xl max-w-md">Uma tarde inteira para cantar, comer e esquecer da hora.</p>
        </div>

        <div>
          <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-6">
            <div>
              <p className="text-[#FF6B00] tracking-widest text-sm font-semibold mb-2 uppercase">Agenda Aberta</p>
              <h2 className="text-5xl font-heading font-bold uppercase">ESCOLHE A RODA.</h2>
            </div>
            <select className="bg-transparent border border-gray-700 text-white p-2 outline-none uppercase text-sm font-bold tracking-widest">
              <option>JUNHO 2024</option>
            </select>
          </div>

          <div className="border border-gray-800 p-8 flex flex-col md:flex-row justify-between items-center bg-[#221711]">
            <div className="flex items-center gap-8 w-full md:w-auto mb-6 md:mb-0">
              <div className="text-[#FF6B00] text-5xl font-heading font-bold leading-none text-center">
                18<br/><span className="text-2xl">JUN</span>
              </div>
              <div>
                <h3 className="text-3xl font-heading font-bold uppercase mb-2">PAGODE DO HUDSON</h3>
                <p className="text-gray-300 mb-3">Grupo Fundo de Quintal + convidados</p>
                <div className="flex gap-4 text-sm text-gray-500 uppercase tracking-widest font-semibold">
                  <span>⌚ A partir das 20h</span>
                  <span>📍 Boteco do Hudson</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
              <span className="font-heading font-bold text-2xl">R$ 35</span>
              <button
                type="button"
                onClick={() => onNavigate('/reservation')}
                className="bg-[#FF6B00] text-[#1A110C] font-bold uppercase tracking-wider text-sm px-8 py-3 w-full md:w-auto hover:bg-orange-600 transition"
              >
                Comprar Ingresso
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/reservation')}
                className="border border-gray-600 text-white font-bold uppercase tracking-wider text-sm px-8 py-3 w-full md:w-auto hover:border-white transition"
              >
                Reservar Mesa
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Events;