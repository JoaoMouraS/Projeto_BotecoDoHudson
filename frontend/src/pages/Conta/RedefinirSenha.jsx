import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import { useAuth } from "../../context/AuthContext";
import api, { mensagemDeErro } from "../../services/api";

/** Destino do link de troca de senha (pedido pelo perfil ou por "esqueci a senha"). */
export default function RedefinirSenha() {
  const [params] = useSearchParams();
  const { entrar } = useAuth();
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const token = params.get("token");

  const salvar = async (e) => {
    e.preventDefault();
    setErro("");
    if (senha !== confirmacao) {
      setErro("As senhas não são iguais.");
      return;
    }
    setEnviando(true);
    try {
      const { data } = await api.post("/api/auth/redefinir-senha", { token, novaSenha: senha });
      entrar(data);
      navigate("/perfil", { replace: true, state: { aviso: "Senha alterada! Você saiu de todos os outros aparelhos." } });
    } catch (err) {
      setErro(mensagemDeErro(err, "Link inválido ou expirado."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pagina-simples">
        <span className="subtitle">SEGURANÇA</span>
        <h1>Nova <span className="text-orange">senha.</span></h1>
        {!token ? (
          <p className="aviso aviso--erro">Link incompleto. <Link to="/esqueci-senha">Peça um novo</Link>.</p>
        ) : (
          <form onSubmit={salvar}>
            {erro && <p className="aviso aviso--erro">{erro}</p>}
            <div>
              <label htmlFor="nova">NOVA SENHA (8 A 72 CARACTERES)</label>
              <input id="nova" type="password" autoComplete="new-password" required minLength={8} maxLength={72}
                value={senha} onChange={(e) => setSenha(e.target.value)} />
            </div>
            <div>
              <label htmlFor="conf">REPITA A SENHA</label>
              <input id="conf" type="password" autoComplete="new-password" required minLength={8} maxLength={72}
                value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} />
            </div>
            <button className="btn-submit" disabled={enviando}>{enviando ? "SALVANDO..." : "SALVAR NOVA SENHA"}</button>
          </form>
        )}
      </main>
    </>
  );
}
