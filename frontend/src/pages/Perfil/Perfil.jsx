import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import ConviteCard from '../../components/ConviteCard/ConviteCard';
import { useAuth } from '../../context/AuthContext';
import api, { mensagemDeErro } from '../../services/api';
import { quandoReserva } from '../../utils/convite';
import { formDataComArquivo, prepararImagem } from '../../utils/imagem';
import './Perfil.css';

const Mensagem = ({ msg }) =>
  msg ? <p className={`aviso ${msg.ok ? 'aviso--ok' : 'aviso--erro'}`}>{msg.texto}</p> : null;

const Perfil = () => {
  const { usuario, atualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [reservas, setReservas] = useState([]);
  const [ingressos, setIngressos] = useState([]);
  const [erroReservas, setErroReservas] = useState('');

  const [dados, setDados] = useState({
    nome: usuario.nome || '',
    telefone: usuario.telefone || '',
    dataNascimento: usuario.dataNascimento || '',
  });
  const [msgDados, setMsgDados] = useState(null);
  const [msgFoto, setMsgFoto] = useState(null);
  const [msgSenha, setMsgSenha] = useState(null);
  const [msgVerificacao, setMsgVerificacao] = useState(null);
  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [msgExclusao, setMsgExclusao] = useState(null);

  useEffect(() => {
    api.get('/api/reservas/minhas')
      .then(({ data }) => setReservas(data))
      .catch((err) => setErroReservas(mensagemDeErro(err, 'Não foi possível carregar suas reservas.')));
    api.get('/api/usuarios/me/ingressos').then(({ data }) => setIngressos(data)).catch(() => {});
  }, []);

  const trocarReserva = (atualizada) =>
    setReservas((lista) => lista.map((r) => (r.id === atualizada.id ? atualizada : r)));

  const cancelarReserva = async (id) => {
    if (!window.confirm('Cancelar esta reserva? O link de convite deixa de funcionar.')) return;
    try {
      trocarReserva((await api.patch(`/api/reservas/${id}/cancelar`)).data);
    } catch (err) {
      setErroReservas(mensagemDeErro(err, 'Não foi possível cancelar a reserva.'));
    }
  };

  const removerConvidado = (reservaId) => async (convidado) => {
    if (!window.confirm(`Tirar ${convidado.nome} da lista?`)) return;
    try {
      trocarReserva((await api.delete(`/api/reservas/${reservaId}/convidados/${convidado.id}`)).data);
    } catch (err) {
      setErroReservas(mensagemDeErro(err, 'Não foi possível remover o convidado.'));
    }
  };

  const enviarCapa = (reservaId) => async (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    try {
      const pronto = await prepararImagem(arquivo, 1600);
      trocarReserva((await api.post(`/api/reservas/${reservaId}/capa`, formDataComArquivo(pronto))).data);
    } catch (err) {
      setErroReservas(err.response ? mensagemDeErro(err) : err.message);
    }
  };

  const enviarFoto = async (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setMsgFoto(null);
    try {
      const pronto = await prepararImagem(arquivo, 512);
      atualizarUsuario((await api.post('/api/usuarios/me/foto', formDataComArquivo(pronto))).data);
      setMsgFoto({ ok: true, texto: 'Foto atualizada! Ela aparece no link das suas reservas.' });
    } catch (err) {
      setMsgFoto({ ok: false, texto: err.response ? mensagemDeErro(err) : err.message });
    }
  };

  const removerFoto = async () => {
    try {
      atualizarUsuario((await api.delete('/api/usuarios/me/foto')).data);
    } catch (err) {
      setMsgFoto({ ok: false, texto: mensagemDeErro(err) });
    }
  };

  const salvarDados = async (e) => {
    e.preventDefault();
    setMsgDados(null);
    try {
      const { data } = await api.put('/api/usuarios/me', {
        nome: dados.nome,
        telefone: dados.telefone || null,
        dataNascimento: dados.dataNascimento || null,
      });
      atualizarUsuario(data);
      setMsgDados({ ok: true, texto: 'Dados salvos.' });
    } catch (err) {
      setMsgDados({ ok: false, texto: mensagemDeErro(err, 'Confira os dados informados.') });
    }
  };

  const pedirLinkSenha = async () => {
    setMsgSenha(null);
    try {
      setMsgSenha({ ok: true, texto: (await api.post('/api/usuarios/me/senha/link')).data.mensagem });
    } catch (err) {
      setMsgSenha({ ok: false, texto: mensagemDeErro(err) });
    }
  };

  const reenviarVerificacao = async () => {
    try {
      setMsgVerificacao({ ok: true, texto: (await api.post('/api/usuarios/me/reenviar-verificacao')).data.mensagem });
    } catch (err) {
      setMsgVerificacao({ ok: false, texto: mensagemDeErro(err) });
    }
  };

  const excluirConta = async (e) => {
    e.preventDefault();
    if (!window.confirm('Excluir sua conta e todas as suas reservas? Isso não pode ser desfeito.')) return;
    setMsgExclusao(null);
    try {
      await api.delete('/api/usuarios/me', { data: { senha: senhaExclusao } });
      atualizarUsuario(null);
      navigate('/', { replace: true });
    } catch (err) {
      setMsgExclusao({ ok: false, texto: mensagemDeErro(err, 'Não foi possível excluir a conta.') });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const ativas = reservas.filter((r) => ['AGUARDANDO_CONVIDADOS', 'CONFIRMADA'].includes(r.status) && new Date(r.dataReserva) > new Date());
  const anteriores = reservas.filter((r) => !ativas.includes(r));
  const ingressosFuturos = ingressos.filter((i) => i.valido && new Date(i.dataReserva) > new Date());

  return (
    <>
      <Header />
      <div className="perfil-container">
        {location.state?.aviso && <p className="aviso aviso--ok">{location.state.aviso}</p>}

        {/* ---------------- Cabeçalho com foto ---------------- */}
        <section className="perfil-topo">
          <label className="perfil-foto" htmlFor="foto" title="Trocar foto">
            {usuario.fotoUrl ? <img src={usuario.fotoUrl} alt="Sua foto" /> : <span>{usuario.nome?.charAt(0).toUpperCase()}</span>}
            <em>📷</em>
          </label>
          <input id="foto" type="file" accept="image/*" hidden onChange={enviarFoto} />
          <div>
            <span className="subtitle">ÁREA DO CLIENTE</span>
            <h1>{usuario.nome?.split(' ')[0]}<span className="text-orange">.</span></h1>
            <p className="perfil-email">
              {usuario.email}{' '}
              {usuario.emailVerificado ? <span className="selo selo--ok">verificado</span> : <span className="selo">não verificado</span>}
            </p>
            {usuario.fotoUrl && <button type="button" className="perfil-link-mini" onClick={removerFoto}>remover foto</button>}
          </div>
        </section>
        <Mensagem msg={msgFoto} />

        {!usuario.emailVerificado && (
          <div className="aviso perfil-verificar">
            <strong>Confirme seu e-mail</strong> para reservar mesas e guardar seus ingressos. Enviamos um link para {usuario.email}.{' '}
            {msgVerificacao ? msgVerificacao.texto : <button type="button" onClick={reenviarVerificacao}>Reenviar link</button>}
          </div>
        )}

        {/* ---------------- Ingressos ---------------- */}
        {ingressos.length > 0 && (
          <section className="perfil-secao">
            <h2>MEUS INGRESSOS</h2>
            <div className="perfil-ingressos">
              {(ingressosFuturos.length ? ingressosFuturos : ingressos).map((i) => (
                <Link key={i.codigo} to={`/ingresso/${i.codigo}`} className={`perfil-ingresso ${i.valido ? '' : 'perfil-ingresso--off'}`}>
                  <span className="subtitle">{i.eventoNome || (i.aniversario ? `Aniversário de ${i.anfitriao}` : `Roda de ${i.anfitriao}`)}</span>
                  <strong>{quandoReserva(i)}</strong>
                  <span className="perfil-ingresso__ver">VER INGRESSO →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- Reservas ---------------- */}
        <section className="perfil-secao">
          <div className="perfil-secao__topo">
            <h2>MINHAS RESERVAS</h2>
            <Link to="/reservar" className="perfil-link">+ NOVA RESERVA</Link>
          </div>
          {erroReservas && <p className="aviso aviso--erro">{erroReservas}</p>}
          {reservas.length === 0 && !erroReservas && (
            <p className="perfil-vazio">Você ainda não tem reservas. <Link to="/reservar">Reserve uma mesa</Link> e chame a roda.</p>
          )}

          <div className="perfil-reservas">
            {ativas.map((r) => (
              <article key={r.id} className="perfil-reserva">
                <header>
                  <strong>{r.evento?.nome || (r.exclusiva ? 'Casa exclusiva' : 'Reserva')}</strong>
                  <span>{quandoReserva(r)} · {r.quantidadePessoas} lugares{r.aniversario ? ' · 🎂' : ''}</span>
                </header>
                {r.aniversario && (
                  <div className="perfil-capa">
                    {r.capaUrl && <img src={r.capaUrl} alt="Capa do convite" />}
                    <label className="btn-secundario" htmlFor={`capa-${r.id}`}>
                      {r.capaUrl ? 'TROCAR FOTO DO CONVITE' : '📸 ADICIONAR FOTO AO CONVITE'}
                    </label>
                    <input id={`capa-${r.id}`} type="file" accept="image/*" hidden onChange={enviarCapa(r.id)} />
                  </div>
                )}
                <ConviteCard reserva={r} onRemoverConvidado={removerConvidado(r.id)} />
                {r.convidadosPendentes > 0 && (
                  <p className="perfil-pendentes">+{r.convidadosPendentes} aguardando confirmar pelo e-mail</p>
                )}
                <button type="button" className="perfil-cancelar" onClick={() => cancelarReserva(r.id)}>CANCELAR RESERVA</button>
              </article>
            ))}
          </div>

          {anteriores.length > 0 && (
            <details className="perfil-anteriores">
              <summary>Reservas anteriores e canceladas ({anteriores.length})</summary>
              <ul>
                {anteriores.map((r) => (
                  <li key={r.id}>
                    {r.evento?.nome ? `${r.evento.nome} · ` : ''}{quandoReserva(r)} · {r.confirmados}/{r.metaMinima} ·{' '}
                    {{ CANCELADA: 'cancelada', EXPIRADA: 'mesa liberada (sem check-in)', CONFIRMADA: 'realizada' }[r.status] || 'não atingiu a meta'}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        {/* ---------------- Dados pessoais ---------------- */}
        <section className="perfil-secao">
          <h2>MEUS DADOS</h2>
          <form className="perfil-form" onSubmit={salvarDados}>
            <div className="perfil-campo">
              <label htmlFor="p-nome">NOME</label>
              <input id="p-nome" type="text" maxLength={120} required value={dados.nome}
                onChange={(e) => setDados({ ...dados, nome: e.target.value })} />
            </div>
            <div className="perfil-campo">
              <label htmlFor="p-tel">WHATSAPP</label>
              <input id="p-tel" type="tel" maxLength={20} placeholder="(31) 99999-0000" value={dados.telefone}
                onChange={(e) => setDados({ ...dados, telefone: e.target.value })} />
            </div>
            <div className="perfil-campo">
              <label htmlFor="p-nasc">ANIVERSÁRIO</label>
              <input id="p-nasc" type="date" value={dados.dataNascimento}
                onChange={(e) => setDados({ ...dados, dataNascimento: e.target.value })} />
            </div>
            <Mensagem msg={msgDados} />
            <button type="submit" className="btn-login">SALVAR DADOS</button>
          </form>
        </section>

        {/* ---------------- Segurança ---------------- */}
        <section className="perfil-secao">
          <h2>SEGURANÇA</h2>
          <p className="perfil-vazio">
            Para trocar a senha, enviamos um link para o seu e-mail. Assim, mesmo que alguém pegue seu celular desbloqueado,
            não consegue mudar sua senha. Ao trocar, você sai de todos os outros aparelhos.
          </p>
          <Mensagem msg={msgSenha} />
          <div className="perfil-acoes">
            <button type="button" className="btn-secundario" onClick={pedirLinkSenha}>RECEBER LINK PARA TROCAR SENHA</button>
            <button type="button" className="btn-secundario" onClick={handleLogout}>SAIR DA CONTA</button>
          </div>
        </section>

        {usuario.role !== 'ADMIN' && (
          <section className="perfil-secao perfil-secao--perigo">
            <details>
              <summary>Excluir minha conta</summary>
              <form className="perfil-form" onSubmit={excluirConta}>
                <p>Apaga sua conta, seus dados, fotos e todas as suas reservas. Não dá para desfazer.</p>
                <div className="perfil-campo">
                  <label htmlFor="p-excluir">CONFIRME SUA SENHA</label>
                  <input id="p-excluir" type="password" autoComplete="current-password" required maxLength={72}
                    value={senhaExclusao} onChange={(e) => setSenhaExclusao(e.target.value)} />
                </div>
                <Mensagem msg={msgExclusao} />
                <button type="submit" className="perfil-excluir">EXCLUIR CONTA</button>
              </form>
            </details>
          </section>
        )}
      </div>
    </>
  );
};

export default Perfil;
