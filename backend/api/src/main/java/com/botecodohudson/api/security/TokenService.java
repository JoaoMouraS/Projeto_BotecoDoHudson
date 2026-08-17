package com.botecodohudson.api.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.botecodohudson.api.model.UsuarioModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class TokenService {

    @Value("${api.security.token.secret:SecretKEY}")
    private String secret;

    public String generateToken(UsuarioModel usuario) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
            //API que esta sendo salva o login
                    .withIssuer("boteco-do-hudson-api")
                    .withSubject(usuario.getEmail())
                    .withExpiresAt(genExpirationDate())
                    .sign(algorithm); 

        } catch (Exception exception) {
            throw new RuntimeException("Erro ao gerar token", exception);
        }
    }

    //metodo de validacao do token
    public String validateToken(String token){
         try{
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                .withIssuer("boteco-do-hudson-api")
                .build() 
                .verify(token)
                .getSubject();
         }catch(JWTVerificationException exception){
            return null;
         }
    }



    private Instant genExpirationDate() {
        // Token expira em 2 horas
        return LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00"));
    }
}