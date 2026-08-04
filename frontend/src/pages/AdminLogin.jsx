import React from 'react';

const AdminLogin = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#1A110C] text-white">
      <div className="md:w-1/2 p-12 md:p-24 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF6B00] p-2 rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-[#1A110C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"></path></svg>
          </div>
          <span className="font-heading font-bold text-xl leading-none text-[#FF6B00]">BOTECO<br/><span className="text-white">DO HUDSON</span></span>
        </div>

        <div className="mt-20 mb-20">
          <p className="text-[#FF6B00] tracking-widest text-sm font-semibold mb-4 uppercase">Nos bastidores da roda</p>
          <h1 className="text-7xl md:text-8xl font-heading font-bold uppercase leading-none mb-6">
            A CASA<br/><span className="text-[#FF6B00]">É SUA.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-sm leading-relaxed">
            O painel para cuidar de cada mesa, cada evento e cada história que acontece por aqui.
          </p>
        </div>

        <div className="border-b border-[#FF6B00] w-12 mb-4"></div>
        <p className="text-xs tracking-widest text-gray-500 uppercase">Centro do Rio • Desde 2012</p>
      </div>

      <div className="md:w-1/2 bg-[#221711] p-12 md:p-24 flex flex-col justify-center">
        <p className="text-[#FF6B00] tracking-widest text-xs font-semibold mb-4 uppercase">Área Restrita — Equipe Boteco do Hudson</p>
        <h2 className="text-5xl font-heading font-bold uppercase mb-4">
          ENTRAR NO<br/><span className="text-[#FF6B00]">PAINEL.</span>
        </h2>
        <p className="text-gray-400 text-sm mb-12">A gestão da casa começa por aqui.</p>

        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest uppercase text-gray-400 font-semibold">Email da Equipe</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B00]">✉</span>
              <input type="email" placeholder="hudson@botecodohudson.com.br" className="w-full bg-transparent border border-gray-700 p-4 pl-12 text-white outline-none focus:border-[#FF6B00] transition" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs tracking-widest uppercase text-gray-400 font-semibold">Senha</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B00]">🔒</span>
              <input type="password" placeholder="Digite sua senha" className="w-full bg-transparent border border-gray-700 p-4 pl-12 text-white outline-none focus:border-[#FF6B00] transition" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-white">👁</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/admin/dashboard')}
            className="bg-[#FF6B00] text-[#1A110C] font-bold uppercase tracking-wider text-sm px-8 py-4 w-full flex justify-between items-center hover:bg-orange-600 transition mt-4"
          >
            Entrar no Painel <span>→</span>
          </button>

          <div className="flex justify-between items-center mt-4">
            <button type="button" onClick={() => onNavigate('/')} className="text-xs text-gray-500 hover:text-white underline">Voltar ao site</button>
            <span className="text-xs text-gray-500 flex items-center gap-1">🛡 Acesso protegido</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;