package com.botecodohudson.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

// Sem @Data: o toString() gerado incluiria o hash da senha em logs.
@Getter
@Setter
@ToString(exclude = "senha")
@Entity
@Table(name = "usuarios")
public class UsuarioModel implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 100)
    private String senha;

    @Column(length = 20)
    private String telefone;

    private LocalDate dataNascimento;

    @Column(nullable = false, length = 20)
    private String role = "USER";

    /** Só vira true quando o usuário clica no link enviado ao e-mail. */
    @Column(nullable = false)
    private Boolean emailVerificado = false;

    /** Foto de perfil (tabela imagens). Aparece no link de convite das reservas. */
    private UUID fotoId;

    /** Muda quando a senha é trocada: tokens com versão antiga deixam de valer. */
    @Column(nullable = false)
    private Integer tokenVersao = 0;

    public boolean isAdmin() {
        return "ADMIN".equals(role);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.role.toUpperCase()));
    }

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email;
    }
}
