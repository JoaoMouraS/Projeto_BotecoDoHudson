package com.botecodohudson.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Pedido de reserva. Ou é para um EVENTO (eventoId), ou é EXCLUSIVA num dia sem
 * evento (exclusiva=true + data). Id, status, meta, código e dono vêm do servidor.
 */
public record ReservaRequestDTO(
        Long eventoId,
        LocalDate data,
        Boolean exclusiva,
        @NotBlank @Size(max = 120) String nomeCliente,
        @NotBlank @Size(max = 20) String telefone,
        @NotNull Integer quantidadePessoas,
        Boolean aniversario,
        @Size(max = 280) String mensagem
) {
}
