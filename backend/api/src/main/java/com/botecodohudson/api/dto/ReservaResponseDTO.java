package com.botecodohudson.api.dto;

import com.botecodohudson.api.model.ReservaModel;
import com.botecodohudson.api.model.StatusReserva;

import java.time.LocalDateTime;
import java.util.List;

/** Visão da reserva para o anfitrião e para o admin. */
public record ReservaResponseDTO(
        Long id,
        String nomeCliente,
        String telefone,
        Integer quantidadePessoas,
        Integer metaMinima,
        int confirmados,
        int convidadosPendentes,
        LocalDateTime dataReserva,
        boolean aniversario,
        boolean exclusiva,
        String mensagem,
        String capaUrl,
        EventoResumo evento,
        StatusReserva status,
        boolean checkIn,
        String codigoConvite,
        List<Convidado> convidados
) {
    /** Só id e nome: telefone/e-mail dos amigos não são mostrados nem ao anfitrião. */
    public record Convidado(Long id, String nome) {
    }

    public record EventoResumo(Long id, String nome, String imagemUrl) {
    }

    public static ReservaResponseDTO de(ReservaModel r) {
        var e = r.getEvento();
        return new ReservaResponseDTO(
                r.getIdReserva(),
                r.getNomeCliente(),
                r.getTelefone(),
                r.getQuantidadePessoas(),
                r.getMetaMinima(),
                r.getConfirmados(),
                (int) r.getConvidados().stream().filter(c -> !c.isConfirmado()).count(),
                r.getDataReserva(),
                Boolean.TRUE.equals(r.getAniversario()),
                Boolean.TRUE.equals(r.getExclusiva()),
                r.getMensagem(),
                ImagemUrls.de(r.getCapaId()),
                e == null ? null : new EventoResumo(e.getId(), e.getNome(), e.getImagemUrl()),
                r.getStatus(),
                r.getCheckInEm() != null,
                r.getCodigoConvite(),
                r.getConvidadosConfirmados().stream().map(c -> new Convidado(c.getId(), c.getNome())).toList()
        );
    }
}
