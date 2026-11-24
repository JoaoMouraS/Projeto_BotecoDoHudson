package com.botecodohudson.api.security;

import com.botecodohudson.api.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/** Lê o cookie de sessão e, se for válido, autentica a requisição. */
@Component
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;

    public SecurityFilter(TokenService tokenService, UsuarioRepository usuarioRepository) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = SessaoCookie.ler(request);

        if (token != null) {
            TokenService.Sessao sessao = tokenService.validar(token);
            if (sessao != null) {
                usuarioRepository.findById(sessao.usuarioId())
                        // Senha trocada depois que o token foi emitido → sessão revogada.
                        .filter(u -> u.getTokenVersao().equals(sessao.versao()))
                        .ifPresent(user -> SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities())));
            }
        }

        filterChain.doFilter(request, response);
    }
}
