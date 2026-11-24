import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import api, { mensagemDeErro } from "../../services/api";

/** Destino do link enviado ao convidado: confirma presença e leva ao ingresso. */
export default function ConfirmarConvite() {
  const [params] = useSearchParams();
  const [estado, setEstado] = useState({ carregando: true });
  const enviado = useRef(false);

  useEffect(() => {
    if (enviado.current) return;
    enviado.current = true;
    api.post("/api/convites/confirmar", { token: params.get("token") || "" })
      .then(({ data }) => setEstado({ codigo: data.codigoIngresso }))
      .catch((err) => setEstado({ erro: mensagemDeErro(err, "Link inválido ou expirado.") }));
  }, [params]);

  if (estado.codigo) return <Navigate to={`/ingresso/${estado.codigo}`} replace state={{ novo: true }} />;

  return (
    <>
      <Header />
      <main className="pagina-simples">
        <span className="subtitle">CONVITE</span>
        {estado.carregando && <h1>Confirmando...</h1>}
        {estado.erro && (
          <>
            <h1>Ops.</h1>
            <p className="aviso aviso--erro">{estado.erro}</p>
            <p>Abra de novo o link que seu amigo mandou e retire o convite outra vez.</p>
            <Link to="/" className="btn-submit">IR PARA O SITE</Link>
          </>
        )}
      </main>
    </>
  );
}
