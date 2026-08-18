package com.botecodohudson.api.security;

import com.botecodohudson.api.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // 1. Recupera o token da requisição
        var token = this.recoverToken(request);

        // 2. Se o token existir, faz a validação
        if (token != null) {
            // O tokenService devolve o login (email) armazenado no token, ou null se o token
            // for inválido/expirado.
            var login = tokenService.validateToken(token);

            // Só tenta autenticar se o token era válido. Antes disso o código chamava
            // usuarioRepository.findByEmail(null) quando o token era inválido, o que
            // estourava uma RuntimeException e virava erro 500 em qualquer rota protegida.
            if (login != null) {
                Optional<com.botecodohudson.api.model.UsuarioModel> usuarioOpt = usuarioRepository.findByEmail(login);

                if (usuarioOpt.isPresent()) {
                    var user = usuarioOpt.get();

                    String role = user.getRole();
                    if (role == null || role.isBlank()) {
                        role = "USER";
                    } else if (role.startsWith("ROLE_")) {
                        role = role.substring(5);
                    }

                    var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                    var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);

                    // 3. Força a autenticação para esta requisição específica
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
                // Se o usuário não existir mais no banco, simplesmente segue sem autenticar
                // (a rota protegida vai responder 401/403 normalmente).
            }
        }

        // 4. Continua o fluxo da requisição (passa para o próximo filtro ou para o Controller)
        filterChain.doFilter(request, response);
    }

    // Método auxiliar para extrair o token do cabeçalho
    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null) {
            return null;
        }
        // Remove a palavra "Bearer " e retorna apenas o código do token
        return authHeader.replace("Bearer ", "");
    }
}