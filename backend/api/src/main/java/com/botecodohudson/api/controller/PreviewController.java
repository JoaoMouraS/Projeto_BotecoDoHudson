package com.botecodohudson.api.controller;

import com.botecodohudson.api.config.AppProperties;
import com.botecodohudson.api.dto.ConviteResumoDTO;
import com.botecodohudson.api.service.ConviteService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.HtmlUtils;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Link curto de convite: https://site/c/{codigo}.
 * WhatsApp/Instagram/Telegram leem as tags "og:" desta página para montar a prévia
 * (foto do aniversariante, título e data). Pessoas são redirecionadas na hora para
 * a página do convite.
 */
@RestController
public class PreviewController {

    private static final DateTimeFormatter DIA = DateTimeFormatter.ofPattern("EEEE, dd 'de' MMMM", Locale.of("pt", "BR"));

    private final ConviteService conviteService;
    private final AppProperties app;

    public PreviewController(ConviteService conviteService, AppProperties app) {
        this.conviteService = conviteService;
        this.app = app;
    }

    @GetMapping(value = "/c/{codigo}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> preview(@PathVariable String codigo) {
        ConviteResumoDTO c;
        try {
            c = conviteService.resumo(codigo);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(302).header("Location", "/").build();
        }
        String base = app.urlBase();
        String destino = "/convite/" + codigo;
        String titulo = c.aniversario()
                ? "🎂 Aniversário de " + c.anfitriao() + " no Boteco do Hudson"
                : c.anfitriao() + " te chamou pro Boteco do Hudson";
        String descricao = (c.eventoNome() != null ? c.eventoNome() + " · " : "") + DIA.format(c.dataReserva())
                + " · " + c.confirmados() + " de " + c.metaMinima() + " já confirmaram. Retire seu convite!";
        String imagem = c.capaUrl() != null ? c.capaUrl() : c.anfitriaoFotoUrl() != null ? c.anfitriaoFotoUrl() : c.eventoImagemUrl();
        if (imagem != null && imagem.startsWith("/")) imagem = base + imagem;

        String html = """
                <!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
                <title>%1$s</title>
                <meta property="og:type" content="website">
                <meta property="og:site_name" content="Boteco do Hudson">
                <meta property="og:title" content="%1$s">
                <meta property="og:description" content="%2$s">
                <meta property="og:url" content="%3$s">
                %4$s
                <meta name="twitter:card" content="summary_large_image">
                <meta name="robots" content="noindex">
                <meta http-equiv="refresh" content="0;url=%5$s">
                </head><body><a href="%5$s">Abrir convite</a></body></html>
                """.formatted(
                esc(titulo), esc(descricao), esc(base + "/c/" + codigo),
                imagem == null ? "" : "<meta property=\"og:image\" content=\"" + esc(imagem) + "\">",
                esc(destino));
        return ResponseEntity.ok().header("Cache-Control", "no-cache").body(html);
    }

    private static String esc(String s) {
        return HtmlUtils.htmlEscape(s, "UTF-8");
    }
}
