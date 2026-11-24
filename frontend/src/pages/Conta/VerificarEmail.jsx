import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import { useAuth } from "../../context/AuthContext";
import api, { mensagemDeErro } from "../../services/api";

/** Destino do link "confirmar e-mail" enviado no cadastro. */
export default function VerificarEmail() {
  const [params] = useSearchParams();
  const { entrar } = useAuth();
  const [estado, setEstado] = useState({ carregando: true });
  const enviado = useRef(false); // StrictMode roda efeitos 2x em dev; o token é de uso único

  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    const token = params.get("token");
    if (!token) {
      setEstado({ erro: "Link incompleto." });
      return;
    }
    api.post("/api/auth/verificar-email", { token })
      .then(({ data }) => {
        entrar(data);
        setEstado({ ok: true });
      })
      .catch((err) => setEstado({ erro: mensagemDeErro(err, "Link inválido ou expirado.") }));
  }, [params, entrar]);

  return (
    <>
      <Header />
      <main className="pagina-simples">
        <span className="subtitle">CONFIRMAÇÃO DE E-MAIL</span>
        {estado.carregando && <h1>Confirmando...</h1>}
        {estado.ok && (
          <>
            <h1>E-mail <span className="text-orange">confirmado!</span></h1>
            <p>Pronto, sua conta está liberada para reservar mesas e guardar seus ingressos.</p>
            <Link to="/reservar" className="btn-submit">RESERVAR MESA</Link>
          </>
        )}
        {estado.erro && (
          <>
            <h1>Ops.</h1>
            <p className="aviso aviso--erro">{estado.erro}</p>
            <p>Entre na sua conta e peça um novo link no seu perfil.</p>
            <Link to="/perfil" className="btn-submit">IR PARA O PERFIL</Link>
          </>
        )}
      </main>
    </>
  );
}
