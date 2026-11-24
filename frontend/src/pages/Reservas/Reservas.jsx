import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Header from "../../components/Header/Header";
import ConviteCard from '../../components/ConviteCard/ConviteCard';
import { useAuth } from '../../context/AuthContext';
import api, { mensagemDeErro } from '../../services/api';
import { formDataComArquivo, prepararImagem } from '../../utils/imagem';
import './Reservas.css';

const hojeISO = (somarDias = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + somarDias);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const dataCurta = (iso) => {
  const d = new Date(iso);
  return {
    dia: d.toLocaleDateString('pt-BR', { day: '2-digit' }),
    mes: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase(),
    semana: d.toLocaleDateString('pt-BR', { weekday: 'long' }),
    hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
};

const diaPorExtenso = (isoData) =>
  new Date(`${isoData}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

const Reservas = () => {
  const { isAutenticado, usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const formRef = useRef(null);

  const [regras, setRegras] = useState(null);
  const [eventos, setEventos] = useState(null);
  const [escolha, setEscolha] = useState(null); // { tipo: 'evento', evento } | { tipo: 'exclusiva', data }

  const [dataBusca, setDataBusca] = useState('');
  const [disponibilidade, setDisponibilidade] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const [form, setForm] = useState({ nomeCliente: '', telefone: '', quantidadePessoas: '', aniversario: false, mensagem: '' });
  const [capa, setCapa] = useState(null); // { arquivo, preview }
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [reservaCriada, setReservaCriada] = useState(null);
  const [reenvio, setReenvio] = useState('');

  useEffect(() => {
    api.get('/api/reservas/regras').then(({ data }) => setRegras(data)).catch(() => {});
    api.get('/api/eventos').then(({ data }) => setEventos(data)).catch(() => setEventos([]));
  }, []);

  // Vindo da página de Eventos (/reservar?evento=ID) já abre o formulário daquele evento.
  useEffect(() => {
    const id = Number(params.get('evento'));
    if (id && eventos) {
      const ev = eventos.find((e) => e.id === id);
      if (ev) escolher({ tipo: 'evento', evento: ev });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventos, params]);

  useEffect(() => {
    if (!usuario) return;
    setForm((f) => ({ ...f, nomeCliente: f.nomeCliente || usuario.nome || '', telefone: f.telefone || usuario.telefone || '' }));
  }, [usuario]);

  const minimo = escolha?.tipo === 'exclusiva' ? regras?.minimoPessoasExclusiva ?? 60 : regras?.minimoPessoas ?? 8;
  const maximo = escolha?.tipo === 'exclusiva' ? regras?.maximoPessoasExclusiva ?? 300 : regras?.maximoPessoas ?? 30;
  const limite = (regras?.horarioLimiteChegada ?? '20:00').replace(':00', 'h');

  const escolher = (nova) => {
    setEscolha(nova);
    setErro('');
    setReservaCriada(null);
    const min = nova.tipo === 'exclusiva' ? regras?.minimoPessoasExclusiva ?? 60 : regras?.minimoPessoas ?? 8;
    setForm((f) => ({ ...f, quantidadePessoas: min, aniversario: nova.tipo === 'exclusiva' ? true : f.aniversario }));
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const verDisponibilidade = async (e) => {
    e.preventDefault();
    setBuscando(true);
    setDisponibilidade(null);
    try {
      const { data } = await api.get('/api/reservas/disponibilidade', { params: { data: dataBusca } });
      setDisponibilidade(data);
    } catch (err) {
      setDisponibilidade({ erro: mensagemDeErro(err) });
    } finally {
      setBuscando(false);
    }
  };

  const atualizar = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [campo]: valor }));
  };

  const escolherCapa = async (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    try {
      const pronto = await prepararImagem(arquivo, 1600);
      setCapa({ arquivo: pronto, preview: URL.createObjectURL(pronto) });
    } catch (err) {
      setErro(err.message);
    }
  };

  const reenviarVerificacao = async () => {
    try {
      const { data } = await api.post('/api/usuarios/me/reenviar-verificacao');
      setReenvio(data.mensagem);
    } catch (err) {
      setReenvio(mensagemDeErro(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!isAutenticado) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    setEnviando(true);
    try {
      const corpo = {
        ...form,
        quantidadePessoas: Number(form.quantidadePessoas),
        ...(escolha.tipo === 'evento' ? { eventoId: escolha.evento.id } : { exclusiva: true, data: escolha.data }),
      };
      let { data } = await api.post('/api/reservas', corpo);
      if (capa && form.aniversario) {
        try {
          ({ data } = await api.post(`/api/reservas/${data.id}/capa`, formDataComArquivo(capa.arquivo)));
        } catch {
          setErro('Reserva criada, mas a foto não subiu. Tente de novo pelo seu perfil.');
        }
      }
      setReservaCriada(data);
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      setErro(mensagemDeErro(error, 'Não foi possível solicitar a reserva. Tente novamente.'));
    } finally {
      setEnviando(false);
    }
  };

  const naoVerificado = isAutenticado && usuario && !usuario.emailVerificado;

  return (
    <>
      <Header />
      <div className="reservas-container">
        <div className="reservas-header">
          <span className="subtitle">GARANTA SUA MESA</span>
          <h1>RESERVA SEM <span className="text-orange">APERREIO.</span></h1>
          <p className="reservas-intro">
            Escolha um evento da casa ou uma data. Você recebe um link para chamar a roda e, quando a turma confirma,
            a mesa é sua.
          </p>
        </div>

        {/* ---------------- 1. Eventos ---------------- */}
        <section className="reservas-eventos">
          <div className="secao-topo">
            <h2>PRÓXIMOS EVENTOS</h2>
            <span className="secao-dica">Mesas para {regras?.minimoPessoas ?? 8} a {regras?.maximoPessoas ?? 30} pessoas · chegada até {limite}</span>
          </div>

          {eventos === null && <p className="reservas-muted">Carregando eventos...</p>}
          {eventos?.length === 0 && (
            <p className="aviso">Nenhum evento agendado agora. Escolha uma data abaixo para reservar a casa para o seu grupo.</p>
          )}

          <div className="eventos-grid">
            {eventos?.map((ev) => {
              const d = dataCurta(ev.dataInicio);
              const selecionado = escolha?.tipo === 'evento' && escolha.evento.id === ev.id;
              return (
                <article key={ev.id} className={`evento-card ${selecionado ? 'evento-card--ativo' : ''}`}>
                  <div className="evento-card__img" style={ev.imagemUrl ? { backgroundImage: `url(${ev.imagemUrl})` } : undefined}>
                    <div className="evento-card__data"><strong>{d.dia}</strong><span>{d.mes}</span></div>
                  </div>
                  <div className="evento-card__corpo">
                    <span className="evento-card__quando">{d.semana} · {d.hora}</span>
                    <h3>{ev.nome}</h3>
                    <span className={`evento-card__mesas ${ev.mesasDisponiveis <= 3 ? 'evento-card__mesas--poucas' : ''}`}>
                      {ev.reservasAbertas
                        ? `${ev.mesasDisponiveis} ${ev.mesasDisponiveis === 1 ? 'mesa disponível' : 'mesas disponíveis'}`
                        : 'Reservas encerradas'}
                    </span>
                    <div className="evento-card__acoes">
                      <button type="button" className="btn-submit" disabled={!ev.reservasAbertas}
                        onClick={() => escolher({ tipo: 'evento', evento: ev })}>
                        RESERVAR MESA
                      </button>
                      {ev.url && (
                        <a href={ev.url} target="_blank" rel="noopener noreferrer" className="evento-card__sympla">Ingressos ↗</a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ---------------- 2. Outra data ---------------- */}
        <section className="reservas-outra-data cartao">
          <div>
            <h2>QUER OUTRO DIA?</h2>
            <p className="reservas-muted">Veja se tem evento na data ou se dá para fechar a casa para a sua festa.</p>
          </div>
          <form className="outra-data-form" onSubmit={verDisponibilidade}>
            <input type="date" aria-label="Data" min={hojeISO(0)} value={dataBusca}
              onChange={(e) => { setDataBusca(e.target.value); setDisponibilidade(null); }} required />
            <button className="btn-secundario" disabled={buscando}>{buscando ? 'VERIFICANDO...' : 'VER DISPONIBILIDADE'}</button>
          </form>

          {disponibilidade?.erro && <p className="aviso aviso--erro">{disponibilidade.erro}</p>}
          {disponibilidade?.evento && (
            <div className="aviso disponibilidade">
              <p>Nesse dia tem <strong>{disponibilidade.evento.nome}</strong>! Reserve sua mesa para o evento.</p>
              <button type="button" className="btn-submit" disabled={!disponibilidade.evento.reservasAbertas}
                onClick={() => escolher({ tipo: 'evento', evento: disponibilidade.evento })}>
                RESERVAR PARA O EVENTO
              </button>
            </div>
          )}
          {disponibilidade && !disponibilidade.evento && !disponibilidade.erro && (
            disponibilidade.exclusivaDisponivel ? (
              <div className="exclusiva-pergunta" role="dialog" aria-labelledby="exclusiva-titulo">
                <span className="subtitle">SEM EVENTO EM {diaPorExtenso(disponibilidade.data).toUpperCase()}</span>
                <h3 id="exclusiva-titulo">Quer reservar o boteco só para você?</h3>
                <p>
                  Nesse dia a casa pode ser <strong>exclusiva do seu grupo</strong>. Para comemorar aniversário, o mínimo é
                  de <strong>{regras?.minimoPessoasExclusiva ?? 60} pessoas</strong> confirmadas pelo link de convite.
                  Depois que a meta bater, nossa equipe fala com você no WhatsApp para acertar os detalhes.
                </p>
                <div className="exclusiva-pergunta__acoes">
                  <button type="button" className="btn-submit"
                    onClick={() => escolher({ tipo: 'exclusiva', data: disponibilidade.data })}>
                    SIM, QUERO A CASA SÓ PRA MIM
                  </button>
                  <button type="button" className="btn-secundario" onClick={() => setDisponibilidade(null)}>ESCOLHER OUTRA DATA</button>
                </div>
              </div>
            ) : (
              <p className="aviso aviso--erro">{disponibilidade.motivo}</p>
            )
          )}
        </section>

        {/* ---------------- 3. Formulário ---------------- */}
        {escolha && (
          <div className="reservas-content" ref={formRef}>
            <div className="reservas-form-box">
              {reservaCriada ? (
                <div className="reserva-sucesso">
                  <span className="subtitle">PEDIDO ENVIADO</span>
                  <h2>AGORA CHAMA A RODA.</h2>
                  <p>
                    Mandamos o link para o seu e-mail também. Quando <strong>{reservaCriada.metaMinima} pessoas</strong>{' '}
                    (contando você) confirmarem, a {reservaCriada.exclusiva ? 'casa é sua' : 'mesa é liberada'}.
                  </p>
                  {erro && <p className="aviso aviso--erro">{erro}</p>}
                  <p>Acompanhe tudo em <Link to="/perfil">Meu perfil</Link>.</p>
                  <button type="button" className="btn-secundario" onClick={() => { setEscolha(null); setReservaCriada(null); setCapa(null); }}>
                    FAZER OUTRA RESERVA
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <span className="subtitle">{escolha.tipo === 'evento' ? 'MESA PARA O EVENTO' : 'CASA EXCLUSIVA'}</span>
                  <h2 className="reserva-form-titulo">
                    {escolha.tipo === 'evento' ? escolha.evento.nome : diaPorExtenso(escolha.data)}
                  </h2>
                  <p className="reservas-muted">
                    {escolha.tipo === 'evento'
                      ? `${dataCurta(escolha.evento.dataInicio).semana}, ${new Date(escolha.evento.dataInicio).toLocaleDateString('pt-BR')} · mesa guardada até ${limite}`
                      : `Mínimo de ${minimo} pessoas confirmadas · reserve com ${regras?.diasMinimosExclusiva ?? 7}+ dias de antecedência`}
                  </p>

                  {erro && <p className="form-erro" role="alert">{erro}</p>}
                  {naoVerificado && (
                    <p className="aviso">
                      Confirme seu e-mail para reservar. {reenvio || <button type="button" onClick={reenviarVerificacao}>Reenviar link</button>}
                    </p>
                  )}

                  <div className="form-group">
                    <label htmlFor="nomeCliente">NOME DO RESPONSÁVEL</label>
                    <input id="nomeCliente" type="text" placeholder="Como podemos te chamar?" maxLength={120}
                      value={form.nomeCliente} onChange={atualizar('nomeCliente')} required />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="telefone">WHATSAPP</label>
                      <input id="telefone" type="tel" placeholder="(31) 99999-0000" autoComplete="tel" minLength={10} maxLength={20}
                        value={form.telefone} onChange={atualizar('telefone')} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pessoas">PESSOAS ({minimo} A {maximo})</label>
                      <input id="pessoas" type="number" min={minimo} max={maximo}
                        value={form.quantidadePessoas} onChange={atualizar('quantidadePessoas')} required />
                    </div>
                  </div>

                  <div className="form-checkbox">
                    <input type="checkbox" id="aniversario" checked={form.aniversario} onChange={atualizar('aniversario')} />
                    <label htmlFor="aniversario">
                      <strong>É ANIVERSÁRIO?</strong>
                      <span>VOCÊ GANHA UM LINK DE CONVITE COM A SUA FOTO.</span>
                    </label>
                  </div>

                  {form.aniversario && (
                    <div className="aniversario-extra">
                      <label className="capa-upload" htmlFor="capa">
                        {capa ? <img src={capa.preview} alt="Prévia da capa" /> : <span>📸 Escolher foto para o convite</span>}
                      </label>
                      <input id="capa" type="file" accept="image/*" onChange={escolherCapa} hidden />
                      <div className="form-group">
                        <label htmlFor="mensagem">RECADO PARA OS AMIGOS (OPCIONAL)</label>
                        <textarea id="mensagem" rows={3} maxLength={280} placeholder="Ex.: Vem comemorar comigo! 🎉"
                          value={form.mensagem} onChange={atualizar('mensagem')} />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-submit" disabled={enviando || naoVerificado}>
                    {enviando ? 'ENVIANDO...' : isAutenticado ? 'SOLICITAR RESERVA' : 'ENTRAR PARA RESERVAR'}
                  </button>
                </form>
              )}
            </div>

            <div className="reservas-info-box">
              {reservaCriada ? (
                <ConviteCard reserva={reservaCriada} />
              ) : (
                <>
                  <span className="subtitle">CONFIRMAÇÃO DA TURMA</span>
                  <h2>COMO FUNCIONA</h2>
                  <ol className="reservas-passos">
                    <li><strong>Reserve</strong> e receba seu link de convite (no site e no e-mail).</li>
                    <li><strong>Mande no grupo.</strong> Cada amigo confirma pelo e-mail e ganha o ingresso.</li>
                    <li>
                      <strong>Meta batida, {escolha.tipo === 'evento' ? 'mesa liberada' : 'casa sua'}:</strong> {minimo} pessoas
                      confirmadas, contando você.
                    </li>
                    {escolha.tipo === 'evento' && (
                      <li><strong>Chegue até {limite}.</strong> Depois disso, mesas sem check-in são liberadas.</li>
                    )}
                  </ol>
                </>
              )}
            </div>
          </div>
        )}

        {/* ---------------- 4. Dúvidas ---------------- */}
        <section className="reservas-faq">
          <h2>DÚVIDAS</h2>
          <details>
            <summary>Como reservo mesa em dia de evento?</summary>
            <p>Escolha o evento em “Próximos eventos”, preencha o formulário e compartilhe o link de convite. A mesa é para
              {` ${regras?.minimoPessoas ?? 8} a ${regras?.maximoPessoas ?? 30}`} pessoas e é liberada quando {regras?.minimoPessoas ?? 8} confirmarem (contando você).
              A reserva da mesa é separada do ingresso do evento no Sympla, quando houver.</p>
          </details>
          <details>
            <summary>Até que horas minha mesa fica guardada?</summary>
            <p>Em dias de evento, a mesa fica guardada até as {limite}. Se ninguém do grupo fizer check-in na entrada até lá,
              ela é liberada para outros clientes automaticamente.</p>
          </details>
          <details>
            <summary>Quero comemorar num dia sem evento. Como faço?</summary>
            <p>Em “Quer outro dia?”, escolha a data. Se não tiver evento, você pode reservar a casa exclusiva para o seu grupo.
              Para aniversários, o mínimo é de {regras?.minimoPessoasExclusiva ?? 60} pessoas confirmadas pelo link, e a reserva deve ser feita com pelo
              menos {regras?.diasMinimosExclusiva ?? 7} dias de antecedência. Só um grupo por dia. Quando a meta bater, nossa equipe entra em contato pelo
              WhatsApp para combinar cardápio, horário e valores.</p>
          </details>
          <details>
            <summary>E se não chegar ao mínimo de pessoas?</summary>
            <p>A reserva fica “aguardando a roda” e o link continua aberto até o dia. Sem a meta, a mesa (ou a casa) não fica
              garantida. Você acompanha quantos já confirmaram no seu perfil.</p>
          </details>
          <details>
            <summary>Meus amigos precisam criar conta?</summary>
            <p>Não. Eles abrem o link, colocam nome e e-mail e confirmam pelo e-mail que receberem. O ingresso chega na hora
              por e-mail e, se tiverem conta com esse e-mail, aparece também no perfil deles.</p>
          </details>
          <details>
            <summary>Como funciona o link de aniversário?</summary>
            <p>Marque “É aniversário?” e envie uma foto sua: ela vira a capa do convite e aparece na prévia quando você manda o
              link no WhatsApp. Dá para trocar a foto depois pelo perfil.</p>
          </details>
          <details>
            <summary>Posso cancelar?</summary>
            <p>Sim, a qualquer momento pelo seu perfil, sem custo. O link de convite deixa de funcionar.</p>
          </details>
        </section>
      </div>
    </>
  );
};

export default Reservas;
