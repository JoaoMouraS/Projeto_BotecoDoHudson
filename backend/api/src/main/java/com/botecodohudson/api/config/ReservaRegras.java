package com.botecodohudson.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Regras da casa para reservas (application.properties, prefixo app.reservas).
 * Não são segredos: o front lê pela rota pública GET /api/reservas/regras.
 */
@ConfigurationProperties(prefix = "app.reservas")
public record ReservaRegras(
        /* Dia de evento: pessoas (anfitrião incluso) que precisam retirar o convite para liberar a mesa. */
        int minimoPessoas,
        int maximoPessoas,
        /* Dia sem evento: a casa fica só para o grupo (ex.: aniversário com 60+ pessoas). */
        int minimoPessoasExclusiva,
        int maximoPessoasExclusiva,
        int diasMinimosExclusiva,
        /* Mesa segurada até esse horário no dia do evento; sem check-in, é liberada. */
        String horarioLimiteChegada,
        int mesasPorEvento,
        int diasAntecedenciaMaxima,
        int reservasAtivasPorUsuario
) {
}
