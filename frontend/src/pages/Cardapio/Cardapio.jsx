import React, { useEffect, useState } from 'react';
import Header from "../../components/Header/Header";
import api from '../../services/api';
import './Cardapio.css';

const Cardapio = () => {    
  const [produtos, setProdutos] = useState([]);
  const [categoria, setCategoria] = useState('Todos');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.get('/api/cardapio')
      .then(({ data }) => setProdutos(data))
      .catch(() => setErro('Não foi possível carregar o cardápio.'))
      .finally(() => setCarregando(false));
  }, []);

  const categorias = ['Todos', ...new Set(produtos.map((produto) => produto.categoria))];
  const produtosFiltrados = categoria === 'Todos'
    ? produtos
    : produtos.filter((produto) => produto.categoria === categoria);

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
            <span className="prato-dia-badge">CARDÁPIO ATUALIZADO</span>
            <h2>FEITO PRA COMPARTILHAR</h2>
            <p>Escolha sua categoria e monte a roda com os sabores da casa.</p>
          </div>

          {/* Navegação do Menu */}
          <nav className="menu-nav">
            {categorias.map((item) => (
              <button key={item} className={categoria === item ? 'active' : ''} onClick={() => setCategoria(item)}>
                {item}
              </button>
            ))}
          </nav>

          {/* Lista de Itens */}
          <div className="menu-list">
            {carregando && <p>Carregando cardápio...</p>}
            {erro && <p role="alert">{erro}</p>}
            {!carregando && !erro && produtosFiltrados.length === 0 && <p>Nenhum item disponível nesta categoria.</p>}
            {produtosFiltrados.map((produto) => (
              <div className="menu-item" key={produto.id}>
                <div className="item-info">
                  <h3>{produto.nome}</h3>
                  <p>{produto.descricao}</p>
                </div>
                <div className="item-price">
                  <span>{Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
        </>

  );
};

export default Cardapio;