import React from 'react';

const Navbar = ({ currentPath, onNavigate }) => {
  const links = [
    { label: 'INÍCIO', path: '/' },
    { label: 'CARDÁPIO', path: '/menu' },
    { label: 'EVENTOS', path: '/events' },
    { label: 'FOTOS', path: '/gallery' },
    { label: 'RESERVAR MESA', path: '/reservation' },
  ];

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-6 bg-[#1A110C] text-white">
      <button type="button" onClick={() => onNavigate('/')} className="flex items-center gap-3 text-left">
        <div className="bg-[#FF6B00] p-2 rounded flex items-center justify-center">
          <svg className="w-6 h-6 text-[#1A110C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 1v3M10 1v3M14 1v3"></path>
          </svg>
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-bold text-xl leading-none text-[#FF6B00] tracking-wide">BOTECO</span>
          <span className="font-bold text-xl leading-none italic tracking-wider">DO HUDSON</span>
        </div>
      </button>

      <div className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-widest text-gray-300">
        {links.map((link) => {
          const isActive = currentPath === link.path;
          return (
            <button
              key={link.path}
              type="button"
              onClick={() => onNavigate(link.path)}
              className={`transition-colors ${isActive ? 'text-[#FF6B00]' : 'hover:text-white'}`}
            >
              {link.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onNavigate('/events')}
        className="hidden md:block bg-[#FF6B00] text-[#1A110C] px-6 py-2 font-bold text-sm tracking-wider hover:bg-orange-600 transition-colors"
      >
        VEM PRO SAMBA
      </button>
    </nav>
  );
};

export default Navbar;