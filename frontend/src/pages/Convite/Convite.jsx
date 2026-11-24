import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import api, { mensagemDeErro } from '../../services/api';
import { STATUS_LABEL, quandoReserva } from '../../utils/convite';
import './Convite.css';

/**
 * Página pública do link de convite (/convite/:codigo).
 * Amigos retiram o convite com nome + e-mail (confirmado por link) — sem criar conta.
 * Em aniversário, vira um convite com a foto do aniversariante.
 */
const Convite = () => {
  const { codigo } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [convite, setConvite] = useState(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [pendente, setPendente] = useState(null); // e-mail para onde mandamos a confirmação

  useEffect(() => {
    api.get(`/api/convites/${encodeURIComponent(codigo)}`)
      .then(({ data }) => setConvite(data))
      .catch((err) => (err.response?.status === 404 ? setNaoEncontrado(true) : setErro(mensagemDeErro(err))));
  }, [codigo]);

  useEffect(() => {
    if (usuario) {
      setForm((f) => ({ nome: f.nome || usuario.nome || '', email: f.email || usuario.email || '', telefone: f.telefone || usuario.telefone || '' }));
    }
  }, [usuario]);

  const contaVerificada = usuario?.emailVerificado;

  const retirar = async (e) => {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const { data } = await api.post(`/api/convites/${encodeURIComponent(codigo)}`, {
        nome: form.nome,
        email: contaVerificada ? usuario.email : form.email,
        telefone: form.telefone || null,
      });
      setConvite(data.convite);
      if (data.situacao === 'CONFIRMADO') {
        navigate(`/ingresso/${data.codigoIngresso}`, { state: { novo: true } });
      } else {
        setPendente(form.email);
      }
    } catch (err) {
      setErro(mensagemDeErro(err, 'Não foi possível retirar o convite.'));
    } finally {
      setEnviando(false);
    }
  };

  if (naoEncontrado) {
    return (
      <>
        <Header />
        <main className="pagina-simples">
          <span className="subtitle">CONVITE</span>
          <h1>Link não encontrado.</h1>
          <p>Confere com quem te mandou se o link está completo.</p>
          <Link to="/" className="btn-submit">CONHECER O BOTECO</Link>
        </main>
      </>
    );
  }

  if (!convite) {
    return (
      <>
        <Header />
        <main className="pagina-simples">{erro ? <p className="aviso aviso--erro">{erro}</p> : <p>Carregando convite...</p>}</main>
      </>
    );
  }

  const faltam = Math.max(convite.metaMinima - convite.confirmados, 0);
  const progresso = Math.min((convite.confirmados / convite.metaMinima) * 100, 100);
  const capa = convite.capaUrl || convite.eventoImagemUrl;
  const titulo = convite.aniversario ? (
    <>ANIVERSÁRIO DE<br /><span className="text-orange">{convite.anfitriao.toUpperCase()}</span></>
  ) : (
    <>{convite.anfitriao.toUpperCase()} TE CHAMOU<br /><span className="text-orange">PRA RODA.</span></>
  );

  return (
    <>
      <Header />
      <div className={`convite-container ${convite.aniversario ? 'convite--aniversario' : ''}`}>
        <section className="convite-hero">
          {capa && <div className="convite-hero__capa" style={{ backgroundImage: `url(${capa})` }} aria-hidden="true" />}
          <div className="convite-hero__conteudo">
            <div className="convite-hero__anfitriao">
              {convite.anfitriaoFotoUrl ? (
                <img src={convite.anfitriaoFotoUrl} alt={`Foto de ${convite.anfitriao}`} />
              ) : (
                <span className="convite-hero__inicial">{convite.anfitriao.charAt(0).toUpperCase()}</span>
              )}
              <span className="subtitle">
                {convite.aniversario ? '🎂 VEM COMEMORAR' : convite.eventoNome ? convite.eventoNome.toUpperCase() : 'CONVITE PRO BOTECO'}
              </span>
            </div>
            <h1>{titulo}</h1>
            <p className="convite-quando">{quandoReserva(convite)} · Boteco do Hudson</p>
            {convite.mensagem && <blockquote className="convite-recado">“{convite.mensagem}”</blockquote>}
          </div>
        </section>

        <div className="convite-grid">
          <div className="convite-box">
            <span className={`convite-status convite-status--${convite.status.toLowerCase()}`}>{STATUS_LABEL[convite.status]}</span>
            <h2>{convite.confirmados} DE {convite.metaMinima} CONFIRMADOS</h2>
            <div className="convite-barra"><div className="convite-barra-fill" style={{ width: `${progresso}%` }} /></div>
            <p className="convite-muted">
              {convite.status === 'CONFIRMADA'
                ? convite.exclusiva ? 'Meta batida: a casa é da turma!' : 'Meta batida: a mesa está garantida!'
                : !convite.status.startsWith('AGUARDANDO')
                  ? 'Esta reserva não está mais ativa.'
                  : `Faltam ${faltam} para ${convite.exclusiva ? 'fechar a casa' : 'a mesa ser liberada'}. Cada convite conta!`}
            </p>
            <ul className="convite-nomes">
              <li className="convite-nomes__anfitriao">{convite.anfitriao}</li>
              {convite.convidados.map((n, i) => <li key={`${n}-${i}`}>{n}</li>)}
            </ul>
          </div>

          <div className="convite-box">
            {pendente ? (
              <div className="convite-ok">
                <span className="subtitle">FALTA SÓ UM CLIQUE</span>
                <h2>CONFERE TEU E-MAIL 📬</h2>
                <p className="convite-muted">
                  Mandamos um link para <strong>{pendente}</strong>. Clique nele para confirmar presença e receber seu
                  ingresso. O convite só conta depois disso (o link vale 24h). Não achou? Olhe o spam.
                </p>
              </div>
            ) : convite.aberto ? (
              <form onSubmit={retirar}>
                <span className="subtitle">RETIRAR CONVITE</span>
                <h2>VAI COLAR?</h2>
                {erro && <p className="aviso aviso--erro" role="alert">{erro}</p>}
                <div className="form-group">
                  <label htmlFor="conv-nome">SEU NOME</label>
                  <input id="conv-nome" type="text" maxLength={80} autoComplete="name"
                    value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
                </div>
                {contaVerificada ? (
                  <p className="convite-muted">O ingresso vai para <strong>{usuario.email}</strong> e fica no seu perfil.</p>
                ) : (
                  <div className="form-group">
                    <label htmlFor="conv-email">SEU E-MAIL (O INGRESSO CHEGA AQUI)</label>
                    <input id="conv-email" type="email" autoComplete="email" maxLength={255}
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="conv-tel">WHATSAPP (OPCIONAL)</label>
                  <input id="conv-tel" type="tel" placeholder="(31) 99999-0000" autoComplete="tel" maxLength={20}
                    value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
                </div>
                <p className="convite-privacidade">
                  Seus dados só são usados para esta reserva. Na lista pública aparece só o seu primeiro nome.
                </p>
                <button type="submit" className="btn-submit" disabled={enviando}>
                  {enviando ? 'ENVIANDO...' : 'RETIRAR MEU CONVITE'}
                </button>
              </form>
            ) : (
              <div>
                <span className="subtitle">CONVITES ENCERRADOS</span>
                <h2>{convite.status === 'CANCELADA' ? 'RESERVA CANCELADA.' : convite.status === 'EXPIRADA' ? 'ESSA JÁ PASSOU.' : 'A RODA ESTÁ COMPLETA.'}</h2>
                <p className="convite-muted">Que tal reservar uma mesa pra sua própria turma?</p>
                <Link to="/reservar" className="btn-submit">RESERVAR MESA</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Convite;
