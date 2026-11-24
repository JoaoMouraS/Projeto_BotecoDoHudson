package com.botecodohudson.api.dto;

import com.botecodohudson.api.model.ReservaModel;
import com.botecodohudson.api.model.StatusReserva;
import com.botecodohudson.api.util.Telefones;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Visão PÚBLICA de uma reserva, mostrada a quem abre o link de convite.
 * Só primeiros nomes — nada de telefone, e-mail ou sobrenome.
 */
public record ConviteResumoDTO(
        String anfitriao,
        String anfitriaoFotoUrl,
        String capaUrl,
        String mensagem,
        LocalDateTime dataReserva,
        boolean aniversario,
        boolean exclusiva,
        String eventoNome,
        String eventoImagemUrl,
        int confirmados,
        int metaMinima,
        int vagas,
        StatusReserva status,
        List<String> convidados,
        boolean aberto
) {
    public static ConviteResumoDTO de(ReservaModel r) {
        boolean aberto = r.getStatus().ativa() && !r.isPassada() && !r.isLotada();
        var e = r.getEvento();
        return new ConviteResumoDTO(
                Telefones.primeiroNome(r.getNomeCliente()),
                ImagemUrls.de(r.getUsuario().getFotoId()),
                ImagemUrls.de(r.getCapaId()),
                r.getMensagem(),
                r.getDataReserva(),
                Boolean.TRUE.equals(r.getAniversario()),
                Boolean.TRUE.equals(r.getExclusiva()),
                e == null ? null : e.getNome(),
                e == null ? null : e.getImagemUrl(),
                r.getConfirmados(),
                r.getMetaMinima(),
                r.getQuantidadePessoas(),
                r.getStatus(),
                r.getConvidadosConfirmados().stream().map(c -> Telefones.primeiroNome(c.getNome())).toList(),
                aberto
        );
    }
}
