import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import api from "../../services/api";
import { uploadPublicImages } from "../../services/supabase";
import "./AdminConteudo.css";

const CONFIG = {
  cardapio: {
    title: "Gerenciar cardápio",
    endpoint: "/api/cardapio",
    fields: [
      ["nome", "Nome", "text"],
      ["categoria", "Categoria", "text"],
      ["descricao", "Descrição", "text"],
      ["preco", "Preço", "number"],
      ["imagemUrl", "URL da imagem", "url"],
    ],
    initial: { nome: "", categoria: "Petiscos", descricao: "", preco: "", imagemUrl: "", disponivel: true },
    name: (item) => item.nome,
  },
  eventos: {
    title: "Gerenciar eventos",
    endpoint: "/api/eventos",
    fields: [
      ["nome", "Nome", "text"],
      ["descricao", "Descrição", "text"],
      ["dataEventoDia", "Data do evento", "date"],
      ["horarioEvento", "Horário do evento", "time"],
      ["local", "Local", "text"],
      ["precoIngresso", "Preço do ingresso", "number"],
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
      if (tipo === "cardapio") payload.preco = Number(payload.preco);
      if (tipo === "eventos") {
        payload.precoIngresso = Number(payload.precoIngresso);
        payload.dataEvento = `${payload.dataEventoDia}T${payload.horarioEvento}`;
        delete payload.dataEventoDia;
        delete payload.horarioEvento;
      }
      const resposta = editando
        ? await api.put(`${config.endpoint}/${editando}`, payload)
        : await api.post(config.endpoint, payload);

      if (tipo === "eventos" && imagens.length > 0) {
        const urls = await uploadPublicImages("event-images", imagens, `events/${resposta.data.id}`);
        const imagensAnteriores = resposta.data.imagensUrls || [];
        await api.put(`${config.endpoint}/${resposta.data.id}`, {
          ...resposta.data,
          imagemUrl: resposta.data.imagemUrl || urls[0],
          imagensUrls: [...imagensAnteriores, ...urls],
        });
      }
      setFormulario(config.initial);
      setEditando(null);
      setImagens([]);
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
                <input name={name} type={type} value={formulario[name] ?? ""} onChange={atualizar} required={name !== "imagemUrl" && name !== "descricao"} step={type === "number" ? "0.01" : undefined} />
              </label>
            ))}
            {tipo === "eventos" && <label>Imagens do evento<input type="file" accept="image/*" multiple onChange={(event) => setImagens(Array.from(event.target.files || []))} /><small>As imagens serão salvas em event-images/events/{editando || "novo-evento"}.</small></label>}
          </div>
          <label className="admin-form__check">
            <input type="checkbox" name={tipo === "cardapio" ? "disponivel" : "publicado"} checked={Boolean(formulario[tipo === "cardapio" ? "disponivel" : "publicado"])} onChange={atualizar} />
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
