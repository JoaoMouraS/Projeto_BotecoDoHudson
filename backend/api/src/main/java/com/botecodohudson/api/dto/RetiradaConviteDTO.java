package com.botecodohudson.api.dto;

/**
 * @param situacao PENDENTE (enviamos um link de confirmação para o e-mail) ou CONFIRMADO (ingresso emitido)
 * @param codigoIngresso preenchido só quando CONFIRMADO
 */
public record RetiradaConviteDTO(String situacao, String codigoIngresso, ConviteResumoDTO convite) {
}
