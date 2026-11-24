package com.botecodohudson.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "tokens_email")
public class TokenEmailModel {

    public enum Tipo { VERIFICAR_EMAIL, REDEFINIR_SENHA }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioModel usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Tipo tipo;

    /** SHA-256 do token. O token em si só existe no link enviado por e-mail. */
    @Column(nullable = false, unique = true, length = 64)
    private String hash;

    @Column(nullable = false)
    private Instant expiraEm;

    private Instant usadoEm;
}
