import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header/Header';
import './Cadastro.css'; 

const Cadastro = () => {
  const navigate = useNavigate();
  
  // Estados para guardar os dados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleCadastro = async (e) => {
    e.preventDefault(); // Evita que a página recarregue
    setErro('');

    try {
      // Faz o POST para o backend
      await axios.post('http://localhost:8080/api/usuarios/cadastrar', {
        nome,
        email,
        senha,
        role: 'USER' // Passando a role padrão
      });

      alert('Cadastro realizado com sucesso! Faça seu login.');
      navigate('/login'); // Redireciona para o login após sucesso

    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErro('Este e-mail já está em uso.');
      } else {
        setErro('Erro ao cadastrar. Tente novamente mais tarde.');
      }
    }
  };

  return (
    <>
      <Header />
      <div className="login-container">
        <div className="login-left">
          <div className="login-overlay">
            <div className="left-content">
              <span className="subtitle">BEM-VINDO AO BOTECO</span>
              <h1>FAÇA PARTE<br /><span className="text-orange">DA RODA.</span></h1>
              <p>Cadastre-se para fazer suas reservas, garantir ingressos para os eventos e não ficar de fora do nosso samba.</p>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-box">
            <span className="subtitle">ÁREA DO CLIENTE</span>
            <h2>NOVA<br /><span className="text-orange">CONTA.</span></h2>

            {/* Exibe mensagem de erro se houver */}
            {erro && <p style={{color: 'red', marginBottom: '15px'}}>{erro}</p>}

            <form onSubmit={handleCadastro}>
              <div className="form-group">
                <label>NOME COMPLETO</label>
                <input 
                  type="text" 
                  placeholder="Digite seu nome" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label>EMAIL</label>
                <input 
                  type="email" 
                  placeholder="seuemail@exemplo.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label>SENHA</label>
                <input 
                  type="password" 
                  placeholder="Crie uma senha forte" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="btn-login">CADASTRAR ➔</button>
            </form>

            <div className="login-footer">
              <Link to="/login">Já tem conta? Faça login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cadastro;