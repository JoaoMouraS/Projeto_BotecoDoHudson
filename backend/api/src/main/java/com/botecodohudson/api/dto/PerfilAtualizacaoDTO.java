package com.botecodohudson.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PerfilAtualizacaoDTO(
        @NotBlank @Size(max = 120) String nome,
        @Size(max = 20) String telefone,
        @Past LocalDate dataNascimento
) {
}
