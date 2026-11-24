package com.botecodohudson.api.evento;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/** Evento cadastrado à mão pelo admin (quando não está no Sympla). */
public record EventoManualDTO(
        @NotBlank @Size(max = 200) String nome,
        @Size(max = 2000) String descricao,
        @NotNull @Future LocalDateTime dataInicio,
        @Size(max = 500) @Pattern(regexp = "^(https://.*)?$", message = "use https") String imagemUrl,
        @Size(max = 500) @Pattern(regexp = "^(https://.*)?$", message = "use https") String url
) {
}
