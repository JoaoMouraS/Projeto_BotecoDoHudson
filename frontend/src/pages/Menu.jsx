import React from 'react';
import Navbar from '../components/Navbar';

const Menu = ({ currentPath, onNavigate }) => {
  const items = [
    { name: 'BOLINHO DO HUDSON', desc: 'massa de mandioca, carne seca e catupiry', price: '28,00', highlight: true },
    { name: 'TORRESMO DE ROLO', desc: 'crocante por fora, macio por dentro, limão', price: '32,00' },
    { name: 'PASTEL DA RODA', desc: 'queijo meia-cura, cebola caramelizada e pimenta', price: '26,00' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar currentPath={currentPath} onNavigate={onNavigate} />
      <main className="flex-grow flex flex-col lg:flex-row px-6 md:px-24 py-12 gap-12">
        <div className="lg:w-1/2 flex flex-col justify-center">
          <p className="text-[#FF6B00] tracking-widest text-sm font-semibold mb-4 uppercase">Direto da Cozinha</p>
          <h1 className="text-6xl md:text-8xl font-heading font-bold leading-none mb-6 uppercase">
            O QUE VAI PRA<br/>MESA.
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Receita de família, brasa sem pressa e tempero que combina com a próxima rodada.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/reservation')}
            className="self-start mt-8 bg-[#FF6B00] text-[#1A110C] px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-orange-600 transition"
          >
            Reservar agora
          </button>
        </div>

        <div className="lg:w-1/2 flex flex-col">
          <div className="bg-[#FF6B00] text-[#1A110C] p-8 mb-8">
            <p className="text-sm font-bold tracking-widest mb-2 uppercase">Prato do Dia • Terça</p>
            <h2 className="text-5xl font-heading font-bold uppercase mb-4">FEIJOADA DO HUDSON</h2>
            <p className="font-medium mb-6">Feijão preto, carnes defumadas, couve, laranja e farofa crocante.</p>
            <p className="text-2xl font-bold font-heading">R$ 49,00</p>
          </div>

          <div className="flex gap-6 border-b border-gray-800 pb-4 mb-6 text-sm font-bold tracking-widest uppercase text-gray-500">
            <span className="text-[#FF6B00] border-b-2 border-[#FF6B00] pb-4 -mb-[18px]">Petiscos</span>
            <span className="cursor-pointer hover:text-white transition">Carnes / Churrasco</span>
            <span className="cursor-pointer hover:text-white transition">Bebidas</span>
            <span className="cursor-pointer hover:text-white transition">Porções</span>
          </div>

          <div className="flex flex-col gap-6">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-start border-b border-gray-800 pb-6">
                <div>
                  <h3 className="text-2xl font-heading font-bold uppercase flex items-center gap-2">
                    {item.name} {item.highlight && <span className="text-[#FF6B00] text-sm">★</span>}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[#FF6B00] font-heading font-bold text-xl">R$ {item.price}</span>
                  <button type="button" className="text-gray-400 hover:text-white text-2xl leading-none mt-2">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Menu;