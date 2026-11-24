package com.botecodohudson.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "eventos")
public class EventoModel {

    public enum Fonte { SYMPLA, MANUAL }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Fonte fonte;

    @Column(unique = true, length = 60)
    private String idExterno;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(columnDefinition = "text")
    private String descricao;

    /** Horário de Brasília. */
    @Column(nullable = false)
    private LocalDateTime dataInicio;

    @Column(length = 500)
    private String imagemUrl;

    @Column(length = 500)
    private String url;

    @Column(nullable = false)
    private Boolean cancelado = false;

    @Column(nullable = false)
    private Instant atualizadoEm = Instant.now();
}
