package com.botecodohudson.api.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.botecodohudson.api.model.UsuarioModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class TokenService {

    private static final String ISSUER = "boteco-do-hudson-api";
    public static final Duration VALIDADE = Duration.ofDays(7);

    private final Algorithm algorithm;

    // O segredo vem SOMENTE da variável de ambiente JWT_SECRET (sem valor padrão).
    // Um segredo curto/fraco permitiria forjar sessões de admin, então a API nem sobe.
    public TokenService(@Value("${api.security.token.secret}") String secret) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET ausente ou muito curto (mínimo 32 caracteres). Configure no .env.");
        }
        this.algorithm = Algorithm.HMAC256(secret);
    }

    public String generateToken(UsuarioModel usuario) {
        Instant agora = Instant.now();
        return JWT.create()
                .withIssuer(ISSUER)
                .withSubject(String.valueOf(usuario.getId()))
                // Versão da sessão: muda quando o usuário troca a senha → tokens antigos morrem.
                .withClaim("v", usuario.getTokenVersao())
                .withIssuedAt(agora)
                .withExpiresAt(agora.plus(VALIDADE))
                .sign(algorithm);
    }

    /** Token válido → (id do usuário, versão). Inválido/expirado → null. */
    public Sessao validar(String token) {
        try {
            DecodedJWT jwt = JWT.require(algorithm).withIssuer(ISSUER).build().verify(token);
            return new Sessao(Long.valueOf(jwt.getSubject()), jwt.getClaim("v").asInt());
        } catch (JWTVerificationException | NumberFormatException exception) {
            return null;
        }
    }

    public record Sessao(Long usuarioId, Integer versao) {
    }
}
