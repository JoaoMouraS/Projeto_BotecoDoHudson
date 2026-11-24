package com.botecodohudson.api.dto;

import com.botecodohudson.api.model.UsuarioModel;

import java.time.LocalDate;

/** Dados do usuário devolvidos ao front. NÃO tem senha nem versão de token. */
public record PerfilDTO(Long id, String nome, String email, boolean emailVerificado, String telefone,
                        LocalDate dataNascimento, String fotoUrl, String role) {

    public static PerfilDTO de(UsuarioModel u) {
        return new PerfilDTO(u.getId(), u.getNome(), u.getEmail(), Boolean.TRUE.equals(u.getEmailVerificado()),
                u.getTelefone(), u.getDataNascimento(), ImagemUrls.de(u.getFotoId()), u.getRole());
    }
}
