export const STATUS_LABEL = {
  AGUARDANDO_CONVIDADOS: "AGUARDANDO A RODA",
  CONFIRMADA: "MESA LIBERADA",
  CANCELADA: "CANCELADA",
  EXPIRADA: "MESA LIBERADA PARA OUTROS",
};

/**
 * Link curto /c/{codigo}: o backend devolve as tags de prévia (foto, título) que o
 * WhatsApp lê e redireciona a pessoa para /convite/{codigo}. Usa o endereço atual do
 * site: em produção vira https://seudominio/c/..., em dev é localhost (só no seu PC).
 */
export function linkDoConvite(codigo) {
  return `${window.location.origin}/c/${codigo}`;
}

/** "sexta-feira, 27 de novembro" */
export function diaPorExtenso(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

/** Texto da data de uma reserva/convite (evento: chegada até 20h; exclusiva: o dia). */
export function quandoReserva(r) {
  const dia = diaPorExtenso(r.dataReserva);
  if (r.exclusiva) return `${dia} · casa exclusiva`;
  const hora = new Date(r.dataReserva).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dia} · chegada até ${hora}`;
}

export function mensagemWhatsApp(reserva, link) {
  const motivo = reserva.aniversario ? "meu aniversário 🎂" : reserva.evento ? reserva.evento.nome : "uma roda";
  return `Bora pro Boteco do Hudson? Reservei pra ${motivo}, ${diaPorExtenso(reserva.dataReserva)}. Retira teu convite aqui pra garantir a mesa: ${link}`;
}
