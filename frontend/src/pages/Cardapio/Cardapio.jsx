import React from 'react';
import Header from "../../components/Header/Header";
import './Cardapio.css';

const Cardapio = () => {    
  return (
  <>
              <Header />

    <div className="cardapio-container">
      <div className="cardapio-content">
        {/* Lado Esquerdo - Destaque */}
        <div className="cardapio-left">
          <span className="subtitle">DIRETO DA COZINHA</span>
          <h1>O QUE VAI PRA MESA.</h1>
          <p>Receita de família, brasa sem pressa e tempero que combina com a próxima rodada.</p>
          <div className="cardapio-image-grid">
            <img src="/assets/pratos.jpg" alt="Pratos variados do boteco" />
          </div>
        </div>

        {/* Lado Direito - Menu */}
        <div className="cardapio-right">
          {/* Prato do Dia */}
          <div className="prato-dia-card">
            <span className="prato-dia-badge">PRATO DO DIA • TERÇA</span>
            <h2>FEIJOADA DO HUDSON</h2>
            <p>Feijão preto, carnes defumadas, couve, laranja e farofa crocante.</p>
            <span className="price">R$ 49,00</span>
          </div>

          {/* Navegação do Menu */}
          <nav className="menu-nav">
            <button className="active">PETISCOS</button>
            <button>CARNES / CHURRASCO</button>
            <button>BEBIDAS</button>
            <button>PORÇÕES</button>
          </nav>

          {/* Lista de Itens */}
          <div className="menu-list">
            <div className="menu-item">
              <div className="item-info">
                <h3>BOLINHO DO HUDSON <span>⭐</span></h3>
                <p>massa de mandioca, carne seca e catupiry</p>
              </div>
              <div className="item-price">
                <span>R$ 28,00</span>
                <button className="add-btn">+</button>
              </div>
            </div>

            <div className="menu-item">
              <div className="item-info">
                <h3>TORRESMO DE ROLO</h3>
                <p>crocante por fora, macio por dentro, limão</p>
              </div>
              <div className="item-price">
                <span>R$ 32,00</span>
                <button className="add-btn">+</button>
              </div>
            </div>

            <div className="menu-item">
              <div className="item-info">
                <h3>PASTEL DA RODA</h3>
                <p>queijo meia-cura, cebola caramelizada e pimenta</p>
              </div>
              <div className="item-price">
                <span>R$ 26,00</span>
                <button className="add-btn">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
        </>

  );
};

export default Cardapio;