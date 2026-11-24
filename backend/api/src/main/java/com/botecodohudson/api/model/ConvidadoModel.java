package com.botecodohudson.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "convidados")
public class ConvidadoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reserva_id", nullable = false)
    private ReservaModel reserva;

    @Column(nullable = false, length = 80)
    private String nome;

    /** Só dígitos (opcional). */
    @Column(length = 20)
    private String telefone;

    /** Sempre minúsculo. Ingresso é enviado para cá e aparece no perfil de quem tem conta com este e-mail. */
    @Column(length = 255)
    private String email;

    /** Preenchido quando quem retirou o convite estava logado. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private UsuarioModel usuario;

    /** Null = ainda não clicou no link do e-mail (não conta para a meta). */
    private Instant confirmadoEm;

    @Column(length = 64, unique = true)
    private String confirmacaoHash;

    private Instant confirmacaoExpiraEm;

    /** Código público do ingresso (/ingresso/{codigo}). */
    @Column(nullable = false, unique = true, length = 32)
    private String codigoIngresso;

    public boolean isConfirmado() {
        return confirmadoEm != null;
    }
}
