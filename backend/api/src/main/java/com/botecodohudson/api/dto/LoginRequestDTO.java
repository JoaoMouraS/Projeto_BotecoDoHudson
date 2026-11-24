package com.botecodohudson.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequestDTO(
        @NotBlank @Size(max = 255) String email,
        @NotBlank @Size(max = 72) String senha
) {
}
