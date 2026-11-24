package com.botecodohudson.api.dto;

import com.botecodohudson.api.evento.EventoDTO;

import java.time.LocalDate;

/**
 * Resposta para "quero reservar no dia X":
 *  - se tem evento → evento preenchido (reservar pelo evento);
 *  - se não tem → exclusivaDisponivel diz se dá para fechar a casa (mínimo de pessoas maior).
 */
public record DisponibilidadeDTO(LocalDate data, EventoDTO evento, boolean exclusivaDisponivel, String motivo) {
}
