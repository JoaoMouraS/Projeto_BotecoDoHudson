import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import api, { mensagemDeErro } from "../../services/api";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMsg(null);
    try {
      const { data } = await api.post("/api/auth/esqueci-senha", { email });
      setMsg({ ok: true, texto: data.mensagem });
    } catch (err) {
      setMsg({ ok: false, texto: mensagemDeErro(err) });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pagina-simples">
        <span className="subtitle">ACESSO</span>
        <h1>Esqueci a <span className="text-orange">senha.</span></h1>
        <p>Informe seu e-mail. Se houver conta, enviamos um link para criar uma nova senha (vale 30 minutos).</p>
        {msg && <p className={`aviso ${msg.ok ? "aviso--ok" : "aviso--erro"}`}>{msg.texto}</p>}
        {!msg?.ok && (
          <form onSubmit={enviar}>
            <div>
              <label htmlFor="esq-email">SEU E-MAIL</label>
              <input id="esq-email" type="email" autoComplete="email" required maxLength={255}
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn-submit" disabled={enviando}>{enviando ? "ENVIANDO..." : "ENVIAR LINK"}</button>
          </form>
        )}
        <p style={{ marginTop: 24 }}><Link to="/login">← Voltar para o login</Link></p>
      </main>
    </>
  );
}
