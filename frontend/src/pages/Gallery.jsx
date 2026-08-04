import React from 'react';
import Navbar from '../components/Navbar';

const Gallery = ({ currentPath, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-5 flex flex-wrap justify-around items-center -z-10 overflow-hidden">
        <span className="text-8xl font-heading font-bold uppercase -rotate-45">Boteco do Hudson</span>
        <span className="text-8xl font-heading font-bold uppercase -rotate-45">Boteco do Hudson</span>
        <span className="text-8xl font-heading font-bold uppercase -rotate-45 mt-40">Boteco do Hudson</span>
      </div>

      <Navbar currentPath={currentPath} onNavigate={onNavigate} />
      <main className="flex-grow px-6 md:px-24 py-12 z-10">
        <p className="text-[#FF6B00] tracking-widest text-sm font-semibold mb-4 uppercase">A noite em imagens</p>
        <h1 className="text-5xl md:text-7xl font-heading font-bold uppercase mb-12">PROCURA SEU SORRISO.</h1>

        <div className="border border-gray-800 p-8 md:p-12 mb-12 flex flex-col md:flex-row justify-between items-center gap-8 bg-[#1A110C]/80 backdrop-blur-sm">
          <div>
            <p className="text-[#FF6B00] tracking-widest text-xs font-semibold mb-2 uppercase">Busca por Rosto</p>
            <h2 className="text-4xl font-heading font-bold uppercase mb-3">ENCONTRE SUAS FOTOS</h2>
            <p className="text-gray-400 text-sm max-w-md">Envie uma selfie ou use a câmera. Nosso fotógrafo digital procura você no meio da roda.</p>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => onNavigate('/events')} className="border border-gray-600 text-[#FF6B00] p-6 hover:bg-gray-800 transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            </button>
            <button type="button" onClick={() => onNavigate('/reservation')} className="bg-[#FF6B00] text-[#1A110C] p-6 hover:bg-orange-600 transition">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </button>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          <button type="button" onClick={() => onNavigate('/gallery')} className="bg-[#FF6B00] text-[#1A110C] font-bold uppercase tracking-widest text-xs px-6 py-3 whitespace-nowrap">
            Todos
          </button>
          <button type="button" onClick={() => onNavigate('/events')} className="border border-gray-700 text-gray-400 font-bold uppercase tracking-widest text-xs px-6 py-3 whitespace-nowrap hover:text-white transition">
            Pagode do Hudson
          </button>
          <button type="button" onClick={() => onNavigate('/reservation')} className="border border-gray-700 text-gray-400 font-bold uppercase tracking-widest text-xs px-6 py-3 whitespace-nowrap hover:text-white transition">
            18 Jun 2024
          </button>
        </div>
      </main>
    </div>
  );
};

export default Gallery;