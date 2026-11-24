package com.botecodohudson.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Retirada de convite pelo link. E-mail obrigatório (é para onde vai o ingresso). */
public record ConviteRequestDTO(
        @NotBlank @Size(max = 80) String nome,
        @NotBlank @Email @Size(max = 255) String email,
        @Size(max = 20) String telefone
) {
}
