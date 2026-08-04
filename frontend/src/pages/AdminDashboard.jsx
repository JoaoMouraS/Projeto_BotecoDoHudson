import React from 'react';

const AdminDashboard = ({ onNavigate }) => {
  const menuItems = [
    { name: 'Dashboard', icon: '⊞', active: true },
    { name: 'Reservas', icon: '📅', badge: '12' },
    { name: 'Eventos', icon: '🎟' },
    { name: 'Cardápio', icon: '🍴' },
    { name: 'Galeria de Fotos', icon: '📷' },
    { name: 'Funcionários', icon: '👥' },
    { name: 'Configurações', icon: '⚙' },
  ];

  const reservas = [
    { cliente: 'Mariana Costa', horario: 'Hoje, 19:30', mesa: '4 pessoas', status: 'Confirmada', statusColor: 'bg-green-900 text-green-300' },
    { cliente: 'Rafael Nunes', horario: 'Hoje, 20:00', mesa: '8 pessoas', status: 'Aguardando ingressos', statusColor: 'bg-yellow-900 text-yellow-300' },
    { cliente: 'João Pedro', horario: 'Hoje, 20:30', mesa: '2 pessoas', status: 'Confirmada', statusColor: 'bg-green-900 text-green-300' },
    { cliente: 'Camila Oliveira', horario: 'Amanhã, 19:00', mesa: '6 pessoas', status: 'Cancelada', statusColor: 'bg-red-900 text-red-300' },
  ];

  return (
    <div className="min-h-screen flex bg-[#1A110C] text-white">
      <aside className="w-64 border-r border-gray-800 flex flex-col">
        <div className="p-8 flex items-center gap-3 border-b border-gray-800">
          <div className="bg-[#FF6B00] p-2 rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-[#1A110C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"></path></svg>
          </div>
          <span className="font-heading font-bold text-xl leading-none text-[#FF6B00]">BOTECO<br/><span className="text-white">DO HUDSON</span></span>
        </div>

        <div className="p-4 flex-grow">
          <p className="text-[10px] tracking-widest text-gray-500 uppercase mb-4 pl-4">Operação da Casa</p>
          <ul className="flex flex-col gap-2">
            {menuItems.map((item, index) => (
              <li key={index} className={`flex justify-between items-center px-4 py-3 rounded cursor-pointer ${item.active ? 'border border-[#FF6B00] text-[#FF6B00]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <div className="flex items-center gap-3 font-medium text-sm">
                  <span>{item.icon}</span>
                  {item.name}
                </div>
                {item.badge && <span className="bg-[#FF6B00] text-[#1A110C] text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex-grow p-8 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-end border-b border-gray-800 pb-6 mb-8">
          <div>
            <p className="text-gray-500 tracking-widest text-xs font-semibold mb-2 uppercase">Quarta-feira, 18 de Junho de 2025</p>
            <h1 className="text-4xl font-heading font-bold uppercase">OLÁ, HUDSON<span className="text-[#FF6B00]">.</span></h1>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-sm font-bold">Hudson Almeida</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-[#FF6B00] flex items-center justify-center text-[#FF6B00] font-bold">
              H
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="border border-gray-800 p-6 bg-[#221711]">
            <div className="flex justify-between items-start mb-4 text-gray-400">
              <span className="text-xs tracking-widest uppercase font-semibold">Reservas Hoje</span>
              <span>📅</span>
            </div>
            <p className="text-4xl font-heading font-bold mb-1">12</p>
            <p className="text-sm text-gray-400 mb-4">mesas confirmadas</p>
            <p className="text-xs text-[#FF6B00]">+3 desde ontem</p>
          </div>
          <div className="border border-gray-800 p-6 bg-[#221711]">
            <div className="flex justify-between items-start mb-4 text-gray-400">
              <span className="text-xs tracking-widest uppercase font-semibold">Ingressos Vendidos</span>
              <span>🎟</span>
            </div>
            <p className="text-4xl font-heading font-bold mb-1">87 / 120</p>
            <p className="text-sm text-gray-400 mb-4">disponíveis</p>
            <p className="text-xs text-[#FF6B00]">72,5% da capacidade</p>
          </div>
          <div className="border border-gray-800 p-6 bg-[#221711]">
            <div className="flex justify-between items-start mb-4 text-gray-400">
              <span className="text-xs tracking-widest uppercase font-semibold">Fotos Vendidas</span>
              <span className="text-[#FF6B00]">💰</span>
            </div>
            <p className="text-4xl font-heading font-bold mb-1">R$ 134,00</p>
            <p className="text-sm text-gray-400 mb-4">sem marca d'água</p>
            <p className="text-xs text-[#FF6B00]">+R$ 28,00 esta semana</p>
          </div>
          <div className="border border-gray-800 p-6 bg-[#221711]">
            <div className="flex justify-between items-start mb-4 text-gray-400">
              <span className="text-xs tracking-widest uppercase font-semibold">Eventos este mês</span>
              <span className="text-[#FF6B00]">📊</span>
            </div>
            <p className="text-4xl font-heading font-bold mb-1">4</p>
            <p className="text-sm text-gray-400 mb-4">programados</p>
            <p className="text-xs text-[#FF6B00]">2 nesta semana</p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          <div className="xl:w-2/3 border border-gray-800 p-6 bg-[#221711]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[#FF6B00] tracking-widest text-[10px] font-semibold mb-1 uppercase">Movimento da Casa</p>
                <h2 className="text-2xl font-heading font-bold uppercase">ÚLTIMAS RESERVAS</h2>
              </div>
              <button type="button" onClick={() => onNavigate('/reservation')} className="text-[#FF6B00] text-xs font-bold uppercase tracking-wider hover:text-white">
                Ver todas &gt;
              </button>
            </div>

            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 uppercase tracking-widest text-[10px] border-b border-gray-800">
                <tr>
                  <th className="pb-4 font-semibold">Cliente</th>
                  <th className="pb-4 font-semibold">Horário</th>
                  <th className="pb-4 font-semibold">Mesa</th>
                  <th className="pb-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((res, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    <td className="py-4 font-bold">{res.cliente}</td>
                    <td className="py-4 text-gray-300">{res.horario}</td>
                    <td className="py-4 text-gray-300">{res.mesa}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${res.statusColor}`}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="xl:w-1/3 border border-gray-800 p-6 bg-[#221711]">
            <p className="text-[#FF6B00] tracking-widest text-[10px] font-semibold mb-1 uppercase">Agenda</p>
            <h2 className="text-2xl font-heading font-bold uppercase mb-6">PRÓXIMOS EVENTOS</h2>

            <div className="flex flex-col gap-6">
              <div className="flex gap-4 items-center">
                <div className="text-[#FF6B00] font-heading font-bold text-center leading-tight">18<br/><span className="text-xs">JUN</span></div>
                <div className="flex-grow">
                  <p className="font-bold text-sm mb-1">Pagode do Hudson</p>
                  <div className="w-full bg-gray-800 h-1 mt-2"><div className="bg-[#FF6B00] h-full" style={{width:'72%'}}></div></div>
                  <p className="text-right text-[10px] text-gray-500 mt-1">87/120</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="text-[#FF6B00] font-heading font-bold text-center leading-tight">22<br/><span className="text-xs">JUN</span></div>
                <div className="flex-grow">
                  <p className="font-bold text-sm mb-1">Feijoada & Batuque</p>
                  <div className="w-full bg-gray-800 h-1 mt-2"><div className="bg-[#FF6B00] h-full" style={{width:'60%'}}></div></div>
                  <p className="text-right text-[10px] text-gray-500 mt-1">54/90</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;