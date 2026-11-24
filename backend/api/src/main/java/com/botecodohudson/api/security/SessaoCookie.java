package com.botecodohudson.api.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * A sessão fica num cookie HttpOnly: o JavaScript da página NÃO consegue lê-lo,
 * então um script malicioso (XSS) não rouba o login — diferente do localStorage.
 */
@Component
public class SessaoCookie {

    public static final String NOME = "boteco_sessao";

    private final TokenService tokenService;

    public SessaoCookie(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    public void criar(com.botecodohudson.api.model.UsuarioModel usuario,
                      HttpServletRequest request, HttpServletResponse response) {
        escrever(tokenService.generateToken(usuario), TokenService.VALIDADE, request, response);
    }

    public void apagar(HttpServletRequest request, HttpServletResponse response) {
        escrever("", Duration.ZERO, request, response);
    }

    public static String ler(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (NOME.equals(c.getName()) && !c.getValue().isBlank()) return c.getValue();
        }
        return null;
    }

    private void escrever(String valor, Duration maxAge, HttpServletRequest request, HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(NOME, valor)
                .httpOnly(true)
                // Em produção (HTTPS) o cookie só trafega criptografado.
                .secure(request.isSecure())
                // Strict: o navegador não envia o cookie em requisições vindas de outros sites (anti-CSRF).
                .sameSite("Strict")
                .path("/api")
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
