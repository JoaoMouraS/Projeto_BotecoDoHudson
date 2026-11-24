package com.botecodohudson.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param url        endereço público do site (links de e-mail e prévia do WhatsApp). Ex.: https://botecodohudson.com.br
 * @param emailFrom  remetente dos e-mails ("Boteco do Hudson <nao-responda@...>")
 * @param symplaToken token da API do Sympla (vazio = só eventos cadastrados à mão)
 * @param symplaUrl  endpoint de listagem de eventos do Sympla
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(String url, String emailFrom, String symplaToken, String symplaUrl) {

    public String urlBase() {
        return url == null ? "http://localhost:5173" : url.replaceAll("/+$", "");
    }

    public boolean emDesenvolvimento() {
        return urlBase().startsWith("http://localhost") || urlBase().startsWith("http://127.");
    }
}
