import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { STATUS_LABEL, linkDoConvite, mensagemWhatsApp } from "../../utils/convite";
import "./ConviteCard.css";

/**
 * Progresso da reserva + link de convite para os amigos (copiar, WhatsApp e QR code).
 * Recebe uma reserva no formato devolvido pela API (ReservaResponseDTO).
 */
export default function ConviteCard({ reserva, onRemoverConvidado }) {
  const [copiado, setCopiado] = useState(false);
  const link = linkDoConvite(reserva.codigoConvite);
  const faltam = Math.max(reserva.metaMinima - reserva.confirmados, 0);
  const progresso = Math.min((reserva.confirmados / reserva.metaMinima) * 100, 100);
  const cancelada = reserva.status === "CANCELADA";

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copie o link:", link);
    }
  };

  return (
    <div className={`convite-card convite-card--${reserva.status.toLowerCase()}`}>
      <span className="convite-card__status">{STATUS_LABEL[reserva.status]}</span>
      <h2 className="convite-card__titulo">
        {reserva.confirmados} DE {reserva.metaMinima} CONFIRMADOS
      </h2>

      <div className="convite-card__barra" role="progressbar" aria-valuenow={reserva.confirmados}
        aria-valuemin={0} aria-valuemax={reserva.metaMinima}>
        <div className="convite-card__barra-fill" style={{ width: `${progresso}%` }} />
      </div>

      <p className="convite-card__texto">
        {cancelada
          ? "Esta reserva foi cancelada e o link não aceita mais convites."
          : faltam > 0
            ? `Faltam ${faltam} ${faltam === 1 ? "pessoa" : "pessoas"} retirarem o convite para a mesa ser liberada. Você já conta como confirmado.`
            : `Meta batida! A mesa está garantida. Ainda cabem ${reserva.quantidadePessoas - reserva.confirmados} na roda.`}
      </p>

      {!cancelada && (
        <div className="convite-card__compartilhar">
          <div className="convite-card__qr">
            <QRCodeSVG value={link} size={96} marginSize={1} />
          </div>
          <div className="convite-card__link">
            <p>Compartilhe com a roda</p>
            <span title={link}>{link.replace(/^https?:\/\//, "")}</span>
            <div className="convite-card__acoes">
              <button type="button" onClick={copiar}>{copiado ? "COPIADO ✓" : "COPIAR LINK"}</button>
              <a href={`https://wa.me/?text=${encodeURIComponent(mensagemWhatsApp(reserva, link))}`}
                target="_blank" rel="noopener noreferrer">
                ENVIAR NO WHATSAPP
              </a>
            </div>
          </div>
        </div>
      )}

      {reserva.convidados?.length > 0 && (
        <div className="convite-card__lista">
          <span>QUEM JÁ RETIROU O CONVITE</span>
          <ul>
            {reserva.convidados.map((c) => (
              <li key={c.id}>
                {c.nome}
                {onRemoverConvidado && !cancelada && (
                  <button type="button" title="Remover da lista" aria-label={`Remover ${c.nome}`}
                    onClick={() => onRemoverConvidado(c)}>×</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
