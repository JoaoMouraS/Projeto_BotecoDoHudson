package com.botecodohudson.api.email;

/** Quem efetivamente entrega o e-mail (SMTP em produção; substituível nos testes). */
public interface Correio {
    void enviar(Email email);
}
