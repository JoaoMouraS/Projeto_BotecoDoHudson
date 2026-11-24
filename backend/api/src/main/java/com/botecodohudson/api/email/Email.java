package com.botecodohudson.api.email;

/** Mensagem pronta para envio (dados já copiados: nada de entidade JPA em outra thread). */
public record Email(String para, String assunto, String html, String linkPrincipal) {
}
