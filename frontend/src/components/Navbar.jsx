import React from 'react';

const links = [
  { label: 'Início', path: '/' },
  { label: 'Cardápio', path: '/menu' },
  { label: 'Eventos', path: '/events' },
  { label: 'Fotos', path: '/gallery' },
  { label: 'Reservar Mesa', path: '/reservation', accent: true },
];

const Navbar = ({ currentPath, onNavigate, user }) => {
  return (
    <header className="border-b border-gray-800">
      <nav className="flex items-center justify-between px-6 md:px-24 py-6">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3"
        >
          <div className="bg-[#FF6B00] p-2 rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-[#1A110C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"></path>
            </svg>
          </div>
          <span className="font-heading font-bold text-xl leading-none text-[#FF6B00] text-left">
            BOTECO<br /><span className="text-white">DO HUDSON</span>
          </span>
        </button>

        <ul className="hidden md:flex items-center gap-10">
          {links.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <li key={link.path}>
                <button
                  type="button"
                  onClick={() => onNavigate(link.path)}
                  className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                    link.accent
                      ? 'text-[#FF6B00] hover:text-orange-400'
                      : isActive
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              type="button"
              onClick={() => onNavigate('/profile')}
              className="border border-[#FF6B00] text-[#FF6B00] font-bold uppercase tracking-wider text-sm px-4 py-3 hover:bg-[#FF6B00] hover:text-[#1A110C] transition-colors whitespace-nowrap"
            >
              Meu Perfil
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="border border-[#FF6B00] text-[#FF6B00] font-bold uppercase tracking-wider text-sm px-4 py-3 hover:bg-[#FF6B00] hover:text-[#1A110C] transition-colors whitespace-nowrap"
            >
              Entrar
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('/events')}
            className="bg-[#FF6B00] text-[#1A110C] font-bold uppercase tracking-wider text-sm px-6 py-3 hover:bg-orange-600 transition-colors whitespace-nowrap"
          >
            Vem Pro Samba
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;