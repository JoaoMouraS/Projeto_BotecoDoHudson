import React from 'react';
import Navbar from '../components/Navbar';

const Home = ({ currentPath, onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#1A110C] font-sans flex flex-col">
      <Navbar currentPath={currentPath} onNavigate={onNavigate} />

      <main className="flex-grow flex items-center px-6 md:px-24">
        <div className="max-w-3xl">
          <p className="text-[#FF6B00] tracking-[0.3em] text-sm font-semibold mb-6 uppercase">
            Desde 2012 • Centro do Rio
          </p>

          <h1 className="text-7xl md:text-8xl lg:text-[150px] font-black leading-[0.85] mb-8 uppercase tracking-tighter">
            <span className="block text-[#FF6B00]">Boteco</span>
            <span className="block text-white">Do Hudson</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl mb-12 max-w-md leading-relaxed">
            Churrasco na brasa, pagode alto e mesa que nunca fica vazia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => onNavigate('/reservation')}
              className="bg-[#FF6B00] text-[#1A110C] px-8 py-4 font-bold tracking-wider text-sm hover:bg-orange-600 transition-colors uppercase"
            >
              Reservar Minha Mesa
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/menu')}
              className="border border-gray-600 text-white px-8 py-4 font-bold tracking-wider text-sm hover:border-white transition-colors uppercase"
            >
              Ver Cardápio
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;