import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Header from "../../components/Header/Header";
import api from "../../services/api";
import { quandoReserva } from "../../utils/convite";
import "./Ingresso.css";

/** Ingresso do convidado: abre pelo link do e-mail ou pelo perfil. Mostrar na entrada. */
export default function Ingresso() {
  const { codigo } = useParams();
  const location = useLocation();
  const [ingresso, setIngresso] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    api.get(`/api/ingressos/${encodeURIComponent(codigo)}`)
      .then(({ data }) => setIngresso(data))
      .catch(() => setErro(true));
  }, [codigo]);

  if (erro) {
    return (
      <>
        <Header />
        <main className="pagina-simples">
          <h1>Ingresso não encontrado.</h1>
          <Link to="/" className="btn-submit">IR PARA O SITE</Link>
        </main>
      </>
    );
  }
  if (!ingresso) return <><Header /><main className="pagina-simples"><p>Carregando...</p></main></>;

  const titulo = ingresso.eventoNome || (ingresso.aniversario ? `Aniversário de ${ingresso.anfitriao}` : `Roda de ${ingresso.anfitriao}`);

  return (
    <>
      <Header />
      <main className="ingresso-pagina">
        {location.state?.novo && <p className="aviso aviso--ok">Presença confirmada! Também mandamos o ingresso para seu e-mail.</p>}
        <article className={`ingresso ${ingresso.valido ? "" : "ingresso--invalido"}`}>
          <div className="ingresso__topo" style={ingresso.eventoImagemUrl ? { backgroundImage: `url(${ingresso.eventoImagemUrl})` } : undefined}>
            <span className="ingresso__marca">BOTECO DO HUDSON</span>
            <h1>{titulo}</h1>
            <p>{quandoReserva(ingresso)}</p>
          </div>
          <div className="ingresso__corte" aria-hidden="true" />
          <div className="ingresso__corpo">
            <div>
              <span className="subtitle">CONVIDADO</span>
              <strong className="ingresso__nome">{ingresso.convidado}</strong>
              <span className="subtitle">NA RODA DE</span>
              <div className="ingresso__anfitriao">
                {ingresso.anfitriaoFotoUrl && <img src={ingresso.anfitriaoFotoUrl} alt="" />}
                <strong>{ingresso.anfitriao}</strong>
              </div>
              {!ingresso.valido && <p className="aviso aviso--erro">Esta reserva não está mais ativa.</p>}
            </div>
            <div className="ingresso__qr">
              <QRCodeSVG value={`${window.location.origin}/ingresso/${ingresso.codigo}`} size={148} marginSize={2} />
              <code>{ingresso.codigo.slice(0, 4)}·{ingresso.codigo.slice(4, 8)}·{ingresso.codigo.slice(8, 12)}</code>
            </div>
          </div>
        </article>
        <p className="ingresso__dica">Mostre este QR code na entrada. Ele também fica salvo em <Link to="/perfil">Meu perfil</Link> se você tiver conta com este e-mail.</p>
      </main>
    </>
  );
}
