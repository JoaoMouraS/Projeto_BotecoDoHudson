package com.botecodohudson.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TokenDTO(@NotBlank @Size(max = 100) String token) {
}
