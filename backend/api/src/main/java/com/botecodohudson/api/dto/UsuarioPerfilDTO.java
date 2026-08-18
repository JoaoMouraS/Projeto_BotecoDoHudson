package com.botecodohudson.api.dto;

/**
 * DTO usado para devolver os dados do usuário autenticado (rota /api/usuarios/me).
 * Propositalmente NÃO inclui o campo "senha" — assim é impossível vazar
 * a senha (nem em hash) por engano nessa resposta.
 */
public class UsuarioPerfilDTO {

    private Long id;
    private String nome;
    private String email;
    private String role;

    public UsuarioPerfilDTO(Long id, String nome, String email, String role) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}