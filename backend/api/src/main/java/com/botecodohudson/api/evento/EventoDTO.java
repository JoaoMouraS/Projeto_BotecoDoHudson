package com.botecodohudson.api.evento;

import com.botecodohudson.api.model.EventoModel;

import java.time.LocalDateTime;

public record EventoDTO(Long id, String nome, String descricao, LocalDateTime dataInicio, String imagemUrl,
                        String url, String fonte, int mesasDisponiveis, boolean reservasAbertas) {

    public static EventoDTO de(EventoModel e, int mesasDisponiveis, boolean reservasAbertas) {
        return new EventoDTO(e.getId(), e.getNome(), e.getDescricao(), e.getDataInicio(), e.getImagemUrl(),
                e.getUrl(), e.getFonte().name(), mesasDisponiveis, reservasAbertas);
    }
}
