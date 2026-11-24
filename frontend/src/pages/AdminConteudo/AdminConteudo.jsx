import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import api from "../../services/api";
import EventCalendar from "../../components/EventCalendar/EventCalendar";
import "./AdminConteudo.css";

const emptyTicket = () => ({
  nome: "", publicoAlvo: "TODOS", preco: "", quantidadeTotal: "", validoAte: "", encerraVendasEm: "",
  meiaEntrada: false, minimoCompra: 1, maximoCompra: 5, descricao: "", visivel: true,
});

const initialEvent = {
  nome: "", descricao: "", descricaoHtml: "", dataEventoDia: "", horarioEvento: "", dataFimDia: "", horarioFim: "",
  local: "Boteco do Hudson", assunto: "Shows e festas", categoria: "", symplaUrl: "", linkTransmissao: "",
  mostrarMapa: true, eventoOnline: false, absorverTaxa: false, nomenclatura: "Ingresso", publicado: false,
};

function SectionCard({ number, title, subtitle, children }) {
  return <section className="event-section">
    <div className="event-section__heading"><span>{number}</span><div><h2>{title}</h2><p>{subtitle}</p></div></div>
    {children}
  </section>;
}

function Field({ label, required, error, children }) {
  return <label className={`event-field ${error ? "event-field--error" : ""}`}>
    <span>{label}{required && <b> *</b>}</span>{children}{error && <small>{error}</small>}
  </label>;
}

function TicketModal({ ticket, paid, onChange, onCancel, onSave }) {
  return <div className="event-modal__backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
    <div className="event-modal" role="dialog" aria-modal="true" aria-labelledby="ticket-modal-title">
      <div className="event-modal__header"><div><span className="eyebrow">Novo lote</span><h2 id="ticket-modal-title">Criar ingresso {paid ? "pago" : "gratuito"}</h2></div><button type="button" onClick={onCancel} aria-label="Fechar">×</button></div>
      {paid && <p className="event-modal__notice">A taxa de serviço será {ticket.absorverTaxa ? "absorvida pelo evento" : "repassada ao comprador"}.</p>}
      <div className="event-modal__grid">
        <Field label="Título" required><input maxLength="45" value={ticket.nome} onChange={(event) => onChange({ nome: event.target.value })} placeholder="Ingresso único, Meia-Entrada, VIP..." /></Field>
        <Field label="Público"><select value={ticket.publicoAlvo} onChange={(event) => onChange({ publicoAlvo: event.target.value })}><option value="TODOS">Todo o público</option><option value="MULHERES">Mulheres</option><option value="HOMENS">Homens</option><option value="CONVIDADOS">Convidados</option><option value="RESERVA">Reserva de mesa</option></select></Field>
        <Field label="Quantidade" required><input type="number" min="1" value={ticket.quantidadeTotal} onChange={(event) => onChange({ quantidadeTotal: event.target.value })} /></Field>
        <Field label="Valor a receber" required><input type="number" min="0" step="0.01" value={paid ? ticket.preco : 0} disabled={!paid} onChange={(event) => onChange({ preco: event.target.value })} placeholder={paid ? "R$ 0,00" : "Grátis"} /></Field>
        <Field label="Início das vendas" required><input type="datetime-local" value={ticket.inicioVendas || ""} onChange={(event) => onChange({ inicioVendas: event.target.value })} /></Field>
        <Field label="Encerra vendas" required><input type="datetime-local" value={ticket.encerraVendasEm} onChange={(event) => onChange({ encerraVendasEm: event.target.value })} /></Field>
        <Field label="Válido até" required><input type="datetime-local" value={ticket.validoAte} onChange={(event) => onChange({ validoAte: event.target.value })} /></Field>
        <Field label="Mínimo por compra"><input type="number" min="1" value={ticket.minimoCompra} onChange={(event) => onChange({ minimoCompra: event.target.value })} /></Field>
        <Field label="Máximo por compra"><input type="number" min="1" value={ticket.maximoCompra} onChange={(event) => onChange({ maximoCompra: event.target.value })} /></Field>
        <Field label="Descrição"><input maxLength="100" value={ticket.descricao} onChange={(event) => onChange({ descricao: event.target.value })} placeholder="Informações para o participante" /></Field>
      </div>
      <label className="event-check"><input type="checkbox" checked={ticket.meiaEntrada} onChange={(event) => onChange({ meiaEntrada: event.target.checked })} /> Criar meia-entrada para este ingresso</label>
      <div className="event-modal__footer"><label className="event-check"><input type="checkbox" checked={ticket.visivel} onChange={(event) => onChange({ visivel: event.target.checked })} /> Visível</label><div><button type="button" className="admin-form__cancel" onClick={onCancel}>Cancelar</button><button type="button" onClick={onSave}>Criar ingresso</button></div></div>
    </div>
  </div>;
}

export default function AdminConteudo({ tipo }) {
  const [items, setItems] = useState([]);
  const [formulario, setFormulario] = useState(initialEvent);
  const [tickets, setTickets] = useState([]);
  const [modal, setModal] = useState(null);
  const [draftTicket, setDraftTicket] = useState(emptyTicket());
  const [imagens, setImagens] = useState([]);
  const [editando, setEditando] = useState(null);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [errosCampos, setErrosCampos] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState("");

  const carregar = async () => {
    try { setItems((await api.get("/api/eventos/admin")).data); }
    catch (error) { setErro(error.response?.data?.message || "Não foi possível carregar os eventos."); console.error(error); }
  };
  useEffect(() => { carregar(); }, []);

  const atualizar = (event) => {
    const { name, value, type, checked } = event.target;
    setFormulario((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const selecionarImagens = (event) => {
    const arquivos = Array.from(event.target.files || []);
    const invalidos = arquivos.filter((file) => !["image/jpeg", "image/png", "image/gif"].includes(file.type) || file.size > 2 * 1024 * 1024);
    if (invalidos.length) {
      setErro("As imagens devem ser JPEG, GIF ou PNG e ter no máximo 2 MB cada.");
      return;
    }
    setErro("");
    setImagens(arquivos);
  };

  const validate = () => {
    const errors = {};
    if (!formulario.nome.trim()) errors.nome = "Informe o nome do evento.";
    if (formulario.nome.length > 100) errors.nome = "Use no máximo 100 caracteres.";
    if (!formulario.dataEventoDia || !formulario.horarioEvento) errors.inicio = "Informe data e hora de início.";
    if (!formulario.dataFimDia || !formulario.horarioFim) errors.fim = "Informe data e hora de término.";
    const inicio = new Date(`${formulario.dataEventoDia}T${formulario.horarioEvento}`);
    const fim = new Date(`${formulario.dataFimDia}T${formulario.horarioFim}`);
    if (!editando && inicio < new Date()) errors.inicio = "O início não pode estar no passado.";
    if (inicio >= fim) errors.fim = "A data de término deve ser depois do início.";
    if (!formulario.assunto) errors.assunto = "Escolha um assunto.";
    if (!formulario.local.trim() && !formulario.eventoOnline) errors.local = "Informe o local ou marque evento online.";
    tickets.forEach((ticket, index) => {
      if (!ticket.nome) errors[`ticket-${index}`] = "Informe o título do ingresso.";
      if (!ticket.quantidadeTotal || Number(ticket.quantidadeTotal) < 1) errors[`ticket-${index}`] = "Informe uma quantidade válida.";
      if (!ticket.validoAte || !ticket.encerraVendasEm) errors[`ticket-${index}`] = "Informe encerramento e validade.";
      if (Number(ticket.minimoCompra) > Number(ticket.maximoCompra)) errors[`ticket-${index}`] = "O mínimo não pode superar o máximo.";
    });
    setErrosCampos(errors);
    return Object.keys(errors).length === 0;
  };

  const salvar = async (publicar) => {
    setErro("");
    if (!validate()) { setErro("Revise os campos destacados antes de continuar."); return; }
    setSalvando(true);
    try {
      const payload = {
        ...formulario,
        dataEvento: `${formulario.dataEventoDia}T${formulario.horarioEvento}`,
        dataFim: `${formulario.dataFimDia}T${formulario.horarioFim}`,
        descricaoHtml: formulario.descricaoHtml || formulario.descricao,
        status: publicar ? "PUBLICADO" : "RASCUNHO",
        publicado: publicar,
      };
      delete payload.dataEventoDia; delete payload.horarioEvento; delete payload.dataFimDia; delete payload.horarioFim;
      const response = editando ? await api.put(`/api/eventos/${editando}`, payload) : await api.post("/api/eventos", payload);
      const eventId = response.data.id;
      if (imagens.length) { const formData = new FormData(); imagens.forEach((file) => formData.append("imagens", file)); await api.post(`/api/eventos/${eventId}/imagens`, formData); }
      for (const ticket of tickets) {
        const ticketPayload = { ...ticket, preco: Number(ticket.preco || 0), quantidadeTotal: Number(ticket.quantidadeTotal), validoAte: ticket.validoAte || payload.dataFim, encerraVendasEm: ticket.encerraVendasEm || payload.dataEvento };
        if (ticket.id) await api.put(`/api/eventos/${eventId}/ingressos/${ticket.id}`, ticketPayload);
        else await api.post(`/api/eventos/${eventId}/ingressos`, ticketPayload);
      }
      setToast(publicar ? "Evento publicado com sucesso." : "Rascunho salvo com sucesso.");
      resetForm(); await carregar();
    } catch (error) {
      console.error("Falha ao salvar evento", error);
      setErro(error.response?.data?.message || error.response?.data || "Não foi possível salvar o evento.");
    } finally { setSalvando(false); }
  };

  const resetForm = () => { setFormulario(initialEvent); setTickets([]); setImagens([]); setEditando(null); setErrosCampos({}); };
  const editar = async (item) => {
    setEditando(item.id);
    setFormulario({ ...initialEvent, ...item, dataEventoDia: item.dataEvento?.slice(0, 10) || "", horarioEvento: item.dataEvento?.slice(11, 16) || "", dataFimDia: item.dataFim?.slice(0, 10) || item.dataEvento?.slice(0, 10) || "", horarioFim: item.dataFim?.slice(11, 16) || item.dataEvento?.slice(11, 16) || "" });
    try { setTickets((await api.get(`/api/eventos/${item.id}/ingressos`)).data); } catch (error) { console.error(error); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const excluir = async (id) => { if (!window.confirm("Excluir este evento?")) return; try { await api.delete(`/api/eventos/${id}`); setToast("Evento excluído."); await carregar(); } catch (error) { setErro(error.response?.data?.message || "Não foi possível excluir o evento."); } };
  const filteredItems = useMemo(() => items.filter((item) => item.nome.toLowerCase().includes(busca.toLowerCase())), [items, busca]);

  return <><Header /><main className="admin-content container">
    <div className="admin-content__topline"><span className="eyebrow">Área administrativa</span><Link to="/dashboard">Voltar ao dashboard</Link></div>
    <h1>{editando ? "Editar evento" : "Criar evento presencial"}</h1><p className="admin-content__intro">Organize a experiência da casa em etapas. Horário de Brasília.</p>
    <form className="admin-form event-form" onSubmit={(event) => { event.preventDefault(); salvar(true); }}>
      <SectionCard number="1" title="Informações básicas" subtitle="Apresente o evento para a sua roda.">
        <Field label="Nome do evento" required error={errosCampos.nome}><input name="nome" maxLength="100" value={formulario.nome} onChange={atualizar} placeholder="Ex.: Domingo no Hudson" /><small className="event-counter">{100 - formulario.nome.length} caracteres restantes</small></Field>
        <div className="event-form__grid"><Field label="Assunto" required error={errosCampos.assunto}><select name="assunto" value={formulario.assunto} onChange={atualizar}><option value="">Selecione</option><option>Shows e festas</option><option>Gastronomia</option><option>Esportes</option><option>Bares e baladas</option><option>Outros</option></select></Field><Field label="Categoria"><input name="categoria" value={formulario.categoria} onChange={atualizar} placeholder="Ex.: Pagode" /></Field></div>
        <Field label="Imagem de divulgação"><input type="file" accept="image/jpeg,image/png,image/gif" multiple onChange={selecionarImagens} /><small>JPEG, GIF ou PNG até 2 MB. Dimensão recomendada: 1600 x 838 pixels.</small></Field>
      </SectionCard>
      <SectionCard number="2" title="Data e horário" subtitle="Defina quando a experiência começa e termina.">
        <div className="event-form__grid"><Field label="Data de início" required error={errosCampos.inicio}><EventCalendar value={formulario.dataEventoDia} min={editando ? formulario.dataEventoDia || new Date().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)} onChange={(value) => setFormulario((current) => ({ ...current, dataEventoDia: value }))} /></Field><Field label="Hora de início" required><input type="time" name="horarioEvento" value={formulario.horarioEvento} onChange={atualizar} /></Field><Field label="Data de término" required error={errosCampos.fim}><EventCalendar value={formulario.dataFimDia} min={formulario.dataEventoDia || new Date().toISOString().slice(0, 10)} onChange={(value) => setFormulario((current) => ({ ...current, dataFimDia: value }))} /></Field><Field label="Hora de término" required><input type="time" name="horarioFim" value={formulario.horarioFim} onChange={atualizar} /></Field></div>
      </SectionCard>
      <SectionCard number="3" title="Descrição do evento" subtitle="Conte a história da noite.">
        <div className="rich-editor__toolbar"><button type="button" onClick={() => document.execCommand("bold")}>B</button><button type="button" onClick={() => document.execCommand("italic")}>I</button><button type="button" onClick={() => document.execCommand("insertUnorderedList")}>• Lista</button></div><div className="rich-editor" contentEditable suppressContentEditableWarning onInput={(event) => setFormulario((current) => ({ ...current, descricaoHtml: event.currentTarget.innerHTML, descricao: event.currentTarget.textContent }))} dangerouslySetInnerHTML={{ __html: formulario.descricaoHtml || formulario.descricao }} /><small>Adicione aqui a descrição do seu evento…</small>
      </SectionCard>
      <SectionCard number="4" title="Onde o evento acontece?" subtitle="Ajude a turma a chegar.">
        <div className="event-form__grid"><Field label="Nome do local" required error={errosCampos.local}><input name="local" value={formulario.local} onChange={atualizar} disabled={formulario.eventoOnline} /></Field><Field label="Link externo de vendas"><input name="symplaUrl" type="url" value={formulario.symplaUrl} onChange={atualizar} placeholder="https://sympla.com.br/..." /></Field></div><label className="event-check"><input type="checkbox" name="eventoOnline" checked={formulario.eventoOnline} onChange={atualizar} /> Evento online</label><label className="event-check"><input type="checkbox" name="mostrarMapa" checked={formulario.mostrarMapa} onChange={atualizar} /> Mostrar endereço no Google Maps</label>
      </SectionCard>
      <SectionCard number="5" title="Ingressos" subtitle="Crie lotes pagos ou gratuitos dentro deste mesmo evento.">
        <div className="ticket-actions"><button type="button" onClick={() => { setDraftTicket({ ...emptyTicket(), preco: "0" }); setModal("free"); }}>+ Ingresso gratuito</button><button type="button" onClick={() => { setDraftTicket(emptyTicket()); setModal("paid"); }}>+ Ingresso pago</button></div><input className="ticket-search" placeholder="Buscar ingressos" />{tickets.length === 0 && <p className="placeholder-text">Nenhum ingresso criado ainda.</p>}{tickets.map((ticket, index) => <div className="ticket-row" key={ticket.id || index}><div><strong>{ticket.nome}</strong><span>{ticket.publicoAlvo || ticket.publico} · {ticket.quantidadeTotal} unidades · {Number(ticket.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></div><button type="button" onClick={() => { setDraftTicket(ticket); setModal(ticket.preco > 0 ? "paid" : "free"); setTickets((current) => current.filter((_, itemIndex) => itemIndex !== index)); }}>Editar</button></div>)}<label className="event-check"><input type="checkbox" name="absorverTaxa" checked={formulario.absorverTaxa} onChange={atualizar} /> Absorver a taxa de serviço</label><Field label="Nomenclatura"><select name="nomenclatura" value={formulario.nomenclatura} onChange={atualizar}><option>Ingresso</option><option>Convite</option><option>Inscrição</option><option>Senha</option></select></Field>
      </SectionCard>
      {erro && <p className="admin-content__error" role="alert">{erro}</p>}<div className="event-form__footer"><button type="button" className="admin-form__cancel" onClick={() => salvar(false)} disabled={salvando}>Salvar rascunho</button><button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Publicar evento"}</button></div>
    </form>
    <section className="admin-list"><div className="admin-content__topline"><h2>Registros cadastrados</h2><input className="ticket-search" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar eventos" /></div>{filteredItems.map((item) => <article className="admin-list__item" key={item.id}><div><strong>{item.nome}</strong><span>{item.dataEvento ? new Date(item.dataEvento).toLocaleString("pt-BR") : "Sem data"} · {item.local} · {item.status || (item.publicado ? "PUBLICADO" : "RASCUNHO")}</span></div><div className="admin-list__actions"><button type="button" onClick={() => editar(item)}>Editar</button><button type="button" onClick={() => excluir(item.id)}>Excluir</button></div></article>)}</section>
    {toast && <div className="event-toast" role="status" onAnimationEnd={() => setToast("")}>{toast}</div>}
    {modal && <TicketModal paid={modal === "paid"} ticket={{ ...draftTicket, absorverTaxa: formulario.absorverTaxa }} onChange={(changes) => setDraftTicket((current) => ({ ...current, ...changes }))} onCancel={() => setModal(null)} onSave={() => { setTickets((current) => [...current, draftTicket]); setModal(null); }} />}
  </main></>;
}
