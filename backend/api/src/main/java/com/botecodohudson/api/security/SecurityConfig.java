package com.botecodohudson.api.security;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final SecurityFilter securityFilter;

    public SecurityConfig(SecurityFilter securityFilter) {
        this.securityFilter = securityFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Front e API no MESMO endereço (Vite proxy em dev / proxy reverso em produção),
            // então não há CORS: nenhum outro site consegue chamar a API com o cookie do usuário.
            // CSRF ligado no modo SPA: cookie XSRF-TOKEN + header X-XSRF-TOKEN (o axios faz sozinho).
            .csrf(csrf -> csrf.spa())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/error").permitAll()
                // Públicas: login/cadastro, links de e-mail, convite e ingresso (amigos sem conta).
                .requestMatchers(HttpMethod.POST, "/api/login", "/api/logout", "/api/usuarios/cadastrar",
                        "/api/auth/**", "/api/convites/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/usuarios/me", "/api/reservas/regras",
                        "/api/reservas/disponibilidade", "/api/eventos", "/api/convites/*",
                        "/api/ingressos/*", "/api/imagens/*").permitAll()
                // Só admin: todas as reservas (nome/telefone dos clientes), check-in e eventos.
                .requestMatchers(HttpMethod.GET, "/api/reservas").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/reservas/*/check-in").hasRole("ADMIN")
                .requestMatchers("/api/eventos/**").hasRole("ADMIN")
                .requestMatchers("/api/**").authenticated()
                // Fora de /api: o site (React) e o link curto /c/{codigo}.
                .anyRequest().permitAll()
            )
            .headers(h -> h
                .contentSecurityPolicy(csp -> csp.policyDirectives(
                    "default-src 'self'; script-src 'self'; connect-src 'self'; "
                    + "img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                    + "font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"))
                .referrerPolicy(r -> r.policy(
                    org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // O SecurityFilter é @Component; sem isso o Spring Boot o registraria também
    // como filtro global, fora da cadeia de segurança.
    @Bean
    public FilterRegistrationBean<SecurityFilter> naoRegistrarSecurityFilterGlobal(SecurityFilter filter) {
        FilterRegistrationBean<SecurityFilter> reg = new FilterRegistrationBean<>(filter);
        reg.setEnabled(false);
        return reg;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
