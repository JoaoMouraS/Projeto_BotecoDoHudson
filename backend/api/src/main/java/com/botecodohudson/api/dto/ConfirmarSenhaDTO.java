package com.botecodohudson.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Usado em ações sensíveis (ex.: excluir conta) para confirmar que é o dono. */
public record ConfirmarSenhaDTO(@NotBlank @Size(max = 72) String senha) {
}
