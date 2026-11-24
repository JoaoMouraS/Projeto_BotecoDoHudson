package com.botecodohudson.api.dto;

import com.botecodohudson.api.model.ConvidadoModel;
import com.botecodohudson.api.model.ReservaModel;
import com.botecodohudson.api.model.StatusReserva;
import com.botecodohudson.api.util.Telefones;

import java.time.LocalDateTime;

/** Ingresso público (/ingresso/{codigo}). Sem e-mail/telefone de ninguém. */
public record IngressoDTO(
        String codigo,
        String convidado,
        String anfitriao,
        String anfitriaoFotoUrl,
        String eventoNome,
        String eventoImagemUrl,
        LocalDateTime dataReserva,
        boolean exclusiva,
        boolean aniversario,
        StatusReserva statusReserva,
        boolean valido
) {
    public static IngressoDTO de(ConvidadoModel c) {
        ReservaModel r = c.getReserva();
        var e = r.getEvento();
        boolean valido = c.isConfirmado() && r.getStatus() != StatusReserva.CANCELADA && r.getStatus() != StatusReserva.EXPIRADA;
        return new IngressoDTO(
                c.getCodigoIngresso(),
                c.getNome(),
                Telefones.primeiroNome(r.getNomeCliente()),
                ImagemUrls.de(r.getUsuario().getFotoId()),
                e == null ? null : e.getNome(),
                e == null ? null : e.getImagemUrl(),
                r.getDataReserva(),
                Boolean.TRUE.equals(r.getExclusiva()),
                Boolean.TRUE.equals(r.getAniversario()),
                r.getStatus(),
                valido);
    }
}
