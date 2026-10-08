import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import api from "../../services/api";
import EventCalendar from "../../components/EventCalendar/EventCalendar";
import "./AdminConteudo.css";

const CONFIG = {
  eventos: {
    title: "Gerenciar eventos",
    endpoint: "/api/eventos",
    fields: [
      ["nome", "Nome", "text"],
      ["descricao", "Descrição", "text"],
      ["dataEventoDia", "Data do evento", "date"],
      ["horarioEvento", "Horário do evento", "time"],
      ["local", "Local", "text"],
      ["symplaUrl", "Link do Sympla", "url"],
    ],
    initial: { nome: "", descricao: "", dataEventoDia: "", horarioEvento: "", local: "Boteco do Hudson", precoIngresso: "", imagemUrl: "", symplaUrl: "", publicado: true },
    name: (item) => item.nome,
  },
};

export default function AdminConteudo({ tipo }) {
  const config = CONFIG[tipo];
  const [items, setItems] = useState([]);
  const [formulario, setFormulario] = useState(config.initial);
  const [editando, setEditando] = useState(null);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [imagens, setImagens] = useState([]);
  const ingressoVazio = { nome: "", publicoAlvo: "TODOS", preco: "", quantidadeTotal: "", validoAte: "", encerraVendasEm: "" };
  const [ingressos, setIngressos] = useState([ingressoVazio]);

  const carregar = async () => {
    try {
      const { data } = await api.get(`${config.endpoint}/admin`);
      setItems(data);
    } catch {
      setErro("Não foi possível carregar os registros.");
    }
  };

  useEffect(() => { carregar(); }, [tipo]);

  const atualizar = (event) => {
    const { name, value, type, checked } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: type === "checkbox" ? checked : value }));
  };

  const salvar = async (event) => {
    event.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      const payload = { ...formulario };
      if (tipo === "eventos") {
        payload.dataEvento = `${payload.dataEventoDia}T${payload.horarioEvento}`;
        delete payload.dataEventoDia;
        delete payload.horarioEvento;
      }
      const resposta = editando
        ? await api.put(`${config.endpoint}/${editando}`, payload)
        : await api.post(config.endpoint, payload);

      if (tipo === "eventos" && imagens.length > 0) {
        const formData = new FormData();
        imagens.forEach((imagem) => formData.append("imagens", imagem));
        await api.post(`/api/eventos/${resposta.data.id}/imagens`, formData);
      }
      if (tipo === "eventos") {
        for (const ingresso of ingressos.filter((item) => item.nome && item.preco !== "" && item.quantidadeTotal !== "")) {
          const ingressoPayload = {
            ...ingresso,
            preco: Number(ingresso.preco),
            quantidadeTotal: Number(ingresso.quantidadeTotal),
            validoAte: ingresso.validoAte.replace("T", "T"),
            encerraVendasEm: ingresso.encerraVendasEm.replace("T", "T"),
          };
          if (ingresso.id) {
            await api.put(`/api/eventos/${resposta.data.id}/ingressos/${ingresso.id}`, ingressoPayload);
          } else {
            await api.post(`/api/eventos/${resposta.data.id}/ingressos`, ingressoPayload);
          }
        }
      }
      setFormulario(config.initial);
      setEditando(null);
      setImagens([]);
      setIngressos([ingressoVazio]);
      await carregar();
    } catch (requestError) {
      setErro(requestError.response?.data?.message || "Não foi possível salvar o registro.");
    } finally {
      setSalvando(false);
    }
  };

  const editar = (item) => {
    setEditando(item.id);
    setFormulario(tipo === "eventos" ? {
      ...item,
      dataEventoDia: item.dataEvento?.slice(0, 10) || "",
      horarioEvento: item.dataEvento?.slice(11, 16) || "",
    } : item);
    if (tipo === "eventos") {
      api.get(`/api/eventos/${item.id}/ingressos`).then(({ data }) => setIngressos(data.map((ingresso) => ({
        ...ingresso,
        validoAte: ingresso.validoAte?.slice(0, 16) || "",
        encerraVendasEm: ingresso.encerraVendasEm?.slice(0, 16) || "",
      })))).catch(() => setIngressos([ingressoVazio]));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const excluir = async (id) => {
    if (!window.confirm("Excluir este registro?")) return;
    try {
      await api.delete(`${config.endpoint}/${id}`);
      setItems((atuais) => atuais.filter((item) => item.id !== id));
    } catch {
      setErro("Não foi possível excluir o registro.");
    }
  };

  return (
    <>
      <Header />
      <main className="admin-content container">
        <div className="admin-content__topline">
          <span className="eyebrow">Área administrativa</span>
          <Link to="/dashboard">Voltar ao dashboard</Link>
        </div>
        <h1>{config.title}</h1>
        <p className="admin-content__intro">Somente administradores autenticados podem alterar estas informações.</p>

        <form className="admin-form" onSubmit={salvar}>
          <h2>{editando ? "Editar registro" : "Novo registro"}</h2>
          <div className="admin-form__grid">
            {config.fields.map(([name, label, type]) => (
              <label key={name}>
                {label}
                {name === "dataEventoDia" ? <EventCalendar value={formulario[name]} min={new Date().toISOString().slice(0, 10)} onChange={(value) => setFormulario((atual) => ({ ...atual, dataEventoDia: value }))} /> : <input name={name} type={type} value={formulario[name] ?? ""} onChange={atualizar} required={name !== "imagemUrl" && name !== "descricao"} step={type === "number" ? "0.01" : undefined} />}
              </label>
            ))}
            {tipo === "eventos" && <div className="ticket-builder">
              <div className="ticket-builder__heading"><h3>Ingressos e lotes</h3><button type="button" onClick={() => setIngressos((atuais) => [...atuais, { ...ingressoVazio }])}>+ Adicionar tipo</button></div>
              {ingressos.map((ingresso, index) => <div className="ticket-builder__row" key={index}>
                <strong>Ingresso {index + 1}</strong>
                <input placeholder="Nome: Off feminino" value={ingresso.nome} onChange={(event) => setIngressos((atuais) => atuais.map((item, itemIndex) => itemIndex === index ? { ...item, nome: event.target.value } : item))} />
                <select value={ingresso.publicoAlvo} onChange={(event) => setIngressos((atuais) => atuais.map((item, itemIndex) => itemIndex === index ? { ...item, publicoAlvo: event.target.value } : item))}><option value="TODOS">Todos</option><option value="MULHERES">Mulheres</option><option value="HOMENS">Homens</option><option value="RESERVA">Reserva de mesa</option></select>
                <input type="number" min="0" step="0.01" placeholder="Preço" value={ingresso.preco} onChange={(event) => setIngressos((atuais) => atuais.map((item, itemIndex) => itemIndex === index ? { ...item, preco: event.target.value } : item))} />
                <input type="number" min="1" placeholder="Quantidade" value={ingresso.quantidadeTotal} onChange={(event) => setIngressos((atuais) => atuais.map((item, itemIndex) => itemIndex === index ? { ...item, quantidadeTotal: event.target.value } : item))} />
                <label>Válido até<input type="datetime-local" value={ingresso.validoAte} onChange={(event) => setIngressos((atuais) => atuais.map((item, itemIndex) => itemIndex === index ? { ...item, validoAte: event.target.value } : item))} /></label>
                <label>Encerra vendas<input type="datetime-local" value={ingresso.encerraVendasEm} onChange={(event) => setIngressos((atuais) => atuais.map((item, itemIndex) => itemIndex === index ? { ...item, encerraVendasEm: event.target.value } : item))} /></label>
                {ingressos.length > 1 && <button type="button" onClick={() => setIngressos((atuais) => atuais.filter((_, itemIndex) => itemIndex !== index))}>Remover</button>}
              </div>)}
            </div>}
            {tipo === "eventos" && <label>Imagens do evento<input type="file" accept="image/*" multiple onChange={(event) => setImagens(Array.from(event.target.files || []))} /><small>As imagens serão salvas em event-images/events/{editando || "novo-evento"}.</small></label>}
          </div>
          <label className="admin-form__check">
            <input type="checkbox" name="publicado" checked={Boolean(formulario.publicado)} onChange={atualizar} />
            Publicado para os clientes
          </label>
          {erro && <p className="admin-content__error" role="alert">{erro}</p>}
          <div className="admin-form__actions">
            <button type="submit" disabled={salvando}>{salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar"}</button>
            {editando && <button type="button" className="admin-form__cancel" onClick={() => { setEditando(null); setFormulario(config.initial); }}>Cancelar</button>}
          </div>
        </form>

        <section className="admin-list">
          <h2>Registros cadastrados</h2>
          {items.length === 0 && <p>Nenhum registro cadastrado.</p>}
          {items.map((item) => (
            <article className="admin-list__item" key={item.id}>
              <div><strong>{config.name(item)}</strong><span>{item.categoria || item.local || ""}</span></div>
              <div className="admin-list__actions"><button type="button" onClick={() => editar(item)}>Editar</button><button type="button" onClick={() => excluir(item.id)}>Excluir</button></div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
