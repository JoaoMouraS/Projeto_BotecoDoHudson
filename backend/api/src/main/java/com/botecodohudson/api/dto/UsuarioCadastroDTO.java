package com.botecodohudson.api.dto;

import lombok.Data;

@Data
public class UsuarioCadastroDTO {
    private String nome;
    private String email;
    private String senha;
    private String role;
}