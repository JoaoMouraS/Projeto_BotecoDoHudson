package com.botecodohudson.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Dados aceitos no cadastro público. Propositalmente NÃO tem campo "role":
 * todo cadastro vira USER. Admin só é criado pelo AdminSeeder (variáveis de ambiente).
 * Senha limitada a 72: o BCrypt ignora o que passar do 72º byte.
 */
public record UsuarioCadastroDTO(
        @NotBlank @Size(max = 120) String nome,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(min = 8, max = 72) String senha,
        @Size(max = 20) String telefone
) {
}
