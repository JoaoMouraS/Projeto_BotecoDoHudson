import React, { useState } from 'react';
import api from '../services/api'; // O seu novo api.js personalizado

const Login = () => {
  // Controle de tela: true = Login | false = Cadastro
  const [isLogin, setIsLogin] = useState(true); 

  // Estados dos formulários
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (isLogin) {
      // ---> LÓGICA DE LOGIN <---
      try {
        const response = await api.post('/login', { email, senha });
        
        // Salva o token retornado pelo seu custom fetch
        localStorage.setItem('token', response.data.token);
        console.log("Acesso liberado!");
        // window.location.href = "/dashboard";
        
      } catch (error) {
        if (error.response && error.response.status === 401) {
          setErro("E-mail ou senha incorretos.");
        } else {
          setErro("Erro de comunicação com o servidor.");
        }
      }
    } else {
      // ---> LÓGICA DE CADASTRO <---
      try {
        // Envia os dados para a rota de registro no back-end
        await api.post('/usuarios/registrar', { 
          nome, 
          email, 
          senha, 
          role: 'USER' // O padrão é registrar como usuário comum
        });
        
        setSucesso("Cadastro realizado com sucesso! Faça seu login.");
        setIsLogin(true); // Volta a tela para o modo de login
        setSenha(''); // Limpa a senha por segurança
        
      } catch (error) {
        setErro("Erro ao realizar cadastro. O e-mail já pode estar em uso.");
      }
    }
  };

  return (
    <div className="container-global">
      <div className="card-padrao">
        <h2 className="titulo-pagina">
          {isLogin ? 'Acesso ao Boteco' : 'Criar Conta'}
        </h2>
        
        {sucesso && <p style={{ color: '#10b981', textAlign: 'center', marginBottom: '1rem' }}>{sucesso}</p>}
        
        <form onSubmit={handleSubmit}>
          
          {/* O campo de NOME só aparece se for CADASTRO */}
          {!isLogin && (
            <div className="form-grupo">
              <label className="form-label">Nome Completo</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Seu nome"
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                required={!isLogin} 
              />
            </div>
          )}

          <div className="form-grupo">
            <label className="form-label">E-mail</label>
            <input 
              type="email" 
              className="form-input"
              placeholder="seu@email.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="form-grupo">
            <label className="form-label">Senha</label>
            <input 
              type="password" 
              className="form-input"
              placeholder="••••••••"
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              required 
            />
          </div>

          {erro && <p className="msg-erro">{erro}</p>}

          <button type="submit" className="btn-principal">
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        {/* Botão para alternar entre Login e Cadastro */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setErro('');
              setSucesso('');
            }}
            style={{ background: 'none', border: 'none', color: 'var(--cor-principal)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;