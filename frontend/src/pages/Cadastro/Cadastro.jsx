import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
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
      await api.post('/api/usuarios/cadastrar', {
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
    <main className="auth-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-overlay">
            <div className="left-content">
              <span className="subtitle">TRADIÇÃO, RESENHA E BOA COMPANHIA</span>
              <h1>FAÇA PARTE<br /><span className="text-orange">DA RODA.</span></h1>
              <p>Crie sua conta para reservar sua mesa e acompanhar as noites do Boteco.</p>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-box">
            <div className="auth-brand">🍺 <strong>Boteco <span>do Hudson</span></strong></div>
            <h2>CRIE SUA<br /><span className="text-orange">CONTA.</span></h2>

            {/* Exibe mensagem de erro se houver */}
            {erro && <p style={{color: 'red', marginBottom: '15px'}}>{erro}</p>}

            <form onSubmit={handleCadastro}>
              <div className="form-group auth-field">
                <label>NOME COMPLETO</label>
                <input 
                  type="text" 
                  placeholder="Digite seu nome" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group auth-field">
                <label>EMAIL</label>
                <input 
                  type="email" 
                  placeholder="seuemail@exemplo.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group auth-field">
                <label>SENHA</label>
                <input 
                  type="password" 
                  placeholder="Crie uma senha forte" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="btn-login">CRIAR CONTA  →</button>
            </form>

            <div className="login-footer">
              <Link className="auth-outline-button" to="/login">← &nbsp; Voltar para login</Link>
            </div>
            <p className="auth-switch">Já tem uma conta? <Link to="/login">Entrar</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cadastro;