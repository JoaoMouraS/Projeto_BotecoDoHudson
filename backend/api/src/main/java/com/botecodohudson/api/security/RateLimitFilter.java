package com.botecodohudson.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

/** Aplica limites por IP nas rotas públicas sensíveis. Responde 429 quando estoura. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter extends OncePerRequestFilter {

    private record Regra(String metodo, String prefixo, int limite, Duration janela) {
    }

    // Ordem importa: a primeira regra cujo prefixo casa é a aplicada.
    private static final List<Regra> REGRAS = List.of(
            new Regra("POST", "/api/login", 10, Duration.ofMinutes(5)),
            new Regra("POST", "/api/usuarios/cadastrar", 5, Duration.ofHours(1)),
            new Regra("POST", "/api/auth/", 10, Duration.ofMinutes(15)),
            new Regra("POST", "/api/usuarios/me/reenviar-verificacao", 5, Duration.ofHours(1)),
            new Regra("POST", "/api/usuarios/me/senha/link", 5, Duration.ofHours(1)),
            new Regra("POST", "/api/usuarios/me/foto", 20, Duration.ofHours(1)),
            new Regra("DELETE", "/api/usuarios/me/foto", 20, Duration.ofHours(1)),
            new Regra("DELETE", "/api/usuarios/me", 10, Duration.ofMinutes(15)),
            new Regra("POST", "/api/convites/", 60, Duration.ofMinutes(10)),
            new Regra("GET", "/api/convites/", 120, Duration.ofMinutes(10)),
            new Regra("GET", "/api/ingressos/", 120, Duration.ofMinutes(10)),
            new Regra("GET", "/api/reservas/disponibilidade", 120, Duration.ofMinutes(10)),
            new Regra("POST", "/api/reservas", 30, Duration.ofHours(1))
    );

    private final RateLimiter rateLimiter;

    public RateLimitFilter(RateLimiter rateLimiter) {
        this.rateLimiter = rateLimiter;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String uri = request.getRequestURI();
        for (Regra r : REGRAS) {
            if (r.metodo().equals(request.getMethod()) && uri.startsWith(r.prefixo())) {
                // getRemoteAddr já considera X-Forwarded-For só de proxies confiáveis
                // (server.forward-headers-strategy=native) — cliente não consegue falsificar.
                String chave = r.metodo() + r.prefixo() + "|" + request.getRemoteAddr();
                if (!rateLimiter.permitir(chave, r.limite(), r.janela())) {
                    response.setStatus(429);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"erro\":\"Muitas tentativas. Aguarde alguns minutos.\"}");
                    return;
                }
                break;
            }
        }
        chain.doFilter(request, response);
    }
}
