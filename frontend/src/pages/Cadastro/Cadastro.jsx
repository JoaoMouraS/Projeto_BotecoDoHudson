import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { mensagemDeErro } from '../../services/api';
import Header from '../../components/Header/Header';
import './Cadastro.css'; 

const Cadastro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { entrar } = useAuth();
  
  // Estados para guardar os dados do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');

  const handleCadastro = async (e) => {
    e.preventDefault(); // Evita que a página recarregue
    setErro('');

    try {
      // Faz o POST para o backend
      // Não enviamos "role": o backend sempre cadastra como USER.
      // A conta já sai logada (cookie de sessão HttpOnly).
      const { data: perfil } = await api.post('/api/usuarios/cadastrar', {
        nome,
        email,
        senha,
        telefone: telefone || null,
      });
      setSenha('');
      entrar(perfil);
      // Conta criada: mostra o aviso para confirmar o e-mail (link enviado).
      navigate('/perfil', {
        replace: true,
        state: { aviso: `Conta criada! Enviamos um link de confirmação para ${perfil.email}. Confirme para poder reservar.` },
      });

    } catch (error) {
      if (error.response?.status === 409) {
        setErro('Este e-mail já está em uso.');
      } else if (error.response?.status === 400) {
        setErro(mensagemDeErro(error, 'Verifique os dados: a senha precisa ter entre 8 e 72 caracteres.'));
      } else {
        setErro(mensagemDeErro(error, 'Erro ao cadastrar. Tente novamente mais tarde.'));
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
                <label>WHATSAPP (OPCIONAL)</label>
                <input
                  type="tel"
                  placeholder="(31) 99999-0000"
                  autoComplete="tel"
                  maxLength={20}
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>SENHA</label>
                <input 
                  type="password" 
                  placeholder="Crie uma senha forte" 
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="btn-login">CADASTRAR ➔</button>
            </form>

            <div className="login-footer">
              <Link to="/login" state={location.state}>Já tem conta? Faça login</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cadastro;