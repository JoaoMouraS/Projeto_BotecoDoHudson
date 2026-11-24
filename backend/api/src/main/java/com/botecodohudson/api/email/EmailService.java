package com.botecodohudson.api.email;

import com.botecodohudson.api.config.AppProperties;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;


/**
 * Monta e envia os e-mails do site. O envio é assíncrono: a resposta da API não
 * espera o SMTP (e "esqueci a senha" responde igual exista ou não a conta).
 * Todo texto vindo do usuário passa por HtmlUtils.htmlEscape.
 */
@Service
public class EmailService {


    private final Correio correio;
    private final AppProperties app;

    public EmailService(Correio correio, AppProperties app) {
        this.correio = correio;
        this.app = app;
    }

    public String link(String caminho) {
        return app.urlBase() + caminho;
    }

    @Async
    public void verificarEmail(String para, String nome, String token) {
        String url = link("/verificar-email?token=" + token);
        correio.enviar(new Email(para, "Confirme seu e-mail no Boteco do Hudson", layout(
                "Bem-vindo à roda, " + esc(primeiro(nome)) + "!",
                "Falta só confirmar que este e-mail é seu. O link vale por 24 horas.",
                "CONFIRMAR MEU E-MAIL", url,
                "Se você não criou conta no Boteco do Hudson, ignore este e-mail."), url));
    }

    @Async
    public void redefinirSenha(String para, String nome, String token) {
        String url = link("/redefinir-senha?token=" + token);
        correio.enviar(new Email(para, "Link para trocar sua senha", layout(
                "Trocar senha",
                "Oi, " + esc(primeiro(nome)) + ". Use o botão abaixo para criar uma nova senha. "
                        + "O link vale por 30 minutos e só funciona uma vez.",
                "CRIAR NOVA SENHA", url,
                "Não pediu isso? Ignore este e-mail: sua senha continua a mesma."), url));
    }

    @Async
    public void confirmarConvite(String para, String nome, String anfitriao, String quando, String token) {
        String url = link("/confirmar-convite?token=" + token);
        correio.enviar(new Email(para, assunto(primeiro(anfitriao) + " te chamou pro Boteco do Hudson"), layout(
                "Confirma tua presença, " + esc(primeiro(nome)) + "!",
                esc(primeiro(anfitriao)) + " reservou mesa no Boteco do Hudson para <strong>" + esc(quando)
                        + "</strong>. Clique para confirmar e receber seu ingresso. O convite só conta depois disso.",
                "CONFIRMAR E PEGAR INGRESSO", url,
                "Não sabe do que se trata? Ignore este e-mail."), url));
    }

    @Async
    public void ingresso(String para, String nome, String anfitriao, String evento, String quando, String codigo) {
        String url = link("/ingresso/" + codigo);
        String titulo = evento != null ? esc(evento) : "Roda de " + esc(primeiro(anfitriao));
        correio.enviar(new Email(para, assunto("Seu ingresso: " + (evento != null ? evento : "Roda de " + primeiro(anfitriao))), layout(
                "Ingresso garantido! 🍻",
                "Tá na lista, " + esc(primeiro(nome)) + ".<br><strong>" + titulo + "</strong><br>" + esc(quando)
                        + "<br><br>Apresente o ingresso (QR code) na entrada. Ele também fica no seu perfil do site.",
                "VER MEU INGRESSO", url,
                "Código do ingresso: " + esc(codigo)), url));
    }

    @Async
    public void reservaCriada(String para, String nome, String quando, String codigoConvite, int meta) {
        String url = link("/c/" + codigoConvite);
        correio.enviar(new Email(para, "Sua reserva no Boteco do Hudson: agora chama a roda!", layout(
                "Reserva criada, " + esc(primeiro(nome)) + "!",
                "Sua reserva para <strong>" + esc(quando) + "</strong> está aguardando a turma. "
                        + "Mande o link para os amigos: quando " + meta + " pessoas (contando você) confirmarem, a mesa é liberada.",
                "ABRIR LINK DE CONVITE", url,
                "Acompanhe tudo em Meu perfil no site."), url));
    }

    @Async
    public void mesaLiberada(String para, String nome, String quando, boolean exclusiva) {
        String url = link("/perfil");
        String extra = exclusiva
                ? "Nossa equipe vai falar com você pelo WhatsApp para acertar os detalhes da festa."
                : "Chegue no horário: depois do limite, mesas sem check-in são liberadas.";
        correio.enviar(new Email(para, "Mesa liberada! 🎉", layout(
                "Meta batida, " + esc(primeiro(nome)) + "!",
                "A turma confirmou e sua reserva para <strong>" + esc(quando) + "</strong> está garantida. " + extra,
                "VER MINHA RESERVA", url, ""), url));
    }

    // ---------------------------------------------------------------- layout

    private String layout(String titulo, String texto, String botao, String url, String rodape) {
        return """
                <!doctype html><html><body style="margin:0;background:#120c08;font-family:Arial,Helvetica,sans-serif">
                <table width="100%%" cellpadding="0" cellspacing="0" style="background:#120c08;padding:32px 12px"><tr><td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#1e140d;border-radius:12px;overflow:hidden">
                  <tr><td style="background:#ff5a1f;padding:18px 28px;color:#120c08;font-weight:bold;letter-spacing:2px;font-size:14px">BOTECO DO HUDSON</td></tr>
                  <tr><td style="padding:32px 28px;color:#f6efe4">
                    <h1 style="margin:0 0 16px;font-size:26px;color:#fff">%s</h1>
                    <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#d9cbb8">%s</p>
                    <a href="%s" style="display:inline-block;background:#ff5a1f;color:#120c08;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:6px;letter-spacing:1px">%s</a>
                    <p style="margin:28px 0 0;font-size:12px;color:#9b8a77;word-break:break-all">Se o botão não funcionar, copie: %s</p>
                    <p style="margin:16px 0 0;font-size:12px;color:#9b8a77">%s</p>
                  </td></tr>
                </table></td></tr></table></body></html>
                """.formatted(titulo, texto, esc(url), botao, esc(url), rodape);
    }


    private static String primeiro(String nome) {
        return nome == null || nome.isBlank() ? "" : nome.trim().split("\\s+")[0];
    }

    /** Assunto é texto puro: sem HTML e sem quebra de linha (evita injeção de cabeçalho). */
    private static String assunto(String s) {
        return s.replaceAll("[\\r\\n]+", " ").trim();
    }

    private static String esc(String s) {
        return s == null ? "" : HtmlUtils.htmlEscape(s, "UTF-8");
    }
}
