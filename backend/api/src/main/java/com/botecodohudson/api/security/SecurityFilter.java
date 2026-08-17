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
            // O tokenService deve retornar o login (ex: email) armazenado no token
            var login = tokenService.validateToken(token);
            
            // Busca o usuário no banco de dados usando Optional e orElseThrow
            var user = usuarioRepository.findByEmail(login)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            // 3. Cria o objeto de autenticação do Spring Security
            String role = user.getRole();
            if (role == null || role.isBlank()) {
                role = "USER";
            } else if (role.startsWith("ROLE_")) {
                role = role.substring(5);
            }

            var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
            var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
            
            // 4. Força a autenticação para esta requisição específica
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 5. Continua o fluxo da requisição (passa para o próximo filtro ou para o Controller)
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