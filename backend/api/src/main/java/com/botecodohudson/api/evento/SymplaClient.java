package com.botecodohudson.api.evento;

import com.botecodohudson.api.config.AppProperties;
import com.botecodohudson.api.util.Horario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Lê os eventos publicados do organizador na API pública do Sympla
 * (header s_token, gerado em Minha Conta > Integrações).
 */
@Component
public class SymplaClient {

    private static final Logger log = LoggerFactory.getLogger(SymplaClient.class);
    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final int MAX_PAGINAS = 10;

    public record EventoSympla(String id, String nome, String descricao, LocalDateTime inicio,
                               String imagem, String url, boolean cancelado, boolean privado, boolean publicado) {
    }

    private final AppProperties app;
    private final RestClient http = RestClient.create();

    public SymplaClient(AppProperties app) {
        this.app = app;
    }

    public boolean configurado() {
        return app.symplaToken() != null && !app.symplaToken().isBlank();
    }

    public List<EventoSympla> eventosFuturos() {
        List<EventoSympla> eventos = new ArrayList<>();
        String desde = LocalDate.now(Horario.FUSO).atStartOfDay().toString();
        for (int pagina = 1; pagina <= MAX_PAGINAS; pagina++) {
            String uri = UriComponentsBuilder.fromUriString(app.symplaUrl())
                    .queryParam("published", "true")
                    .queryParam("from", desde)
                    .queryParam("timezone", "America/Sao_Paulo")
                    .queryParam("sort", "asc")
                    .queryParam("field_sort", "start_date")
                    .queryParam("page", pagina)
                    .queryParam("page_size", 100)
                    .build().toUriString();
            String corpo = http.get().uri(uri).header("s_token", app.symplaToken()).retrieve().body(String.class);
            JsonNode raiz = JSON.readTree(corpo);
            for (JsonNode e : raiz.path("data")) {
                eventos.add(new EventoSympla(
                        texto(e, "id"),
                        texto(e, "name"),
                        semHtml(texto(e, "detail")),
                        data(texto(e, "start_date")),
                        texto(e, "image"),
                        texto(e, "url"),
                        e.path("cancelled").asInt(0) == 1,
                        e.path("private_event").asInt(0) == 1,
                        e.path("published").asInt(1) == 1));
            }
            if (!raiz.path("pagination").path("has_next").asBoolean(false)) break;
        }
        log.info("Sympla: {} eventos lidos.", eventos.size());
        return eventos;
    }

    private static String texto(JsonNode n, String campo) {
        JsonNode v = n.get(campo);
        return v == null || v.isNull() ? null : v.asString();
    }

    /** Aceita "2026-06-18T19:12:37Z" (UTC), "2026-06-18T19:12:37" e "2026-06-18 19:12:37" (horário de Brasília). */
    static LocalDateTime data(String s) {
        if (s == null) return null;
        String v = s.trim().replace(' ', 'T');
        if (v.endsWith("Z") || v.matches(".*[+-]\\d{2}:?\\d{2}$")) {
            return OffsetDateTime.parse(v).atZoneSameInstant(Horario.FUSO).toLocalDateTime();
        }
        return LocalDateTime.parse(v);
    }

    private static String semHtml(String s) {
        if (s == null) return null;
        String t = s.replaceAll("(?s)<[^>]*>", " ").replaceAll("&nbsp;", " ").replaceAll("\\s+", " ").trim();
        return t.length() > 2000 ? t.substring(0, 2000) : t;
    }
}
