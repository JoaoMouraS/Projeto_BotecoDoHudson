package com.botecodohudson.api.email;

import com.botecodohudson.api.config.AppProperties;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * Envia por SMTP (Brevo, Resend, Gmail...). Sem SMTP configurado:
 *  - em desenvolvimento (APP_URL localhost) imprime o link no console para você testar;
 *  - em produção só avisa, NUNCA imprime links (seriam um vazamento nos logs).
 */
@Component
public class CorreioSmtp implements Correio {

    private static final Logger log = LoggerFactory.getLogger(CorreioSmtp.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final AppProperties app;
    private final String host;

    public CorreioSmtp(ObjectProvider<JavaMailSender> mailSender, AppProperties app,
                       @Value("${spring.mail.host:}") String host) {
        this.mailSender = mailSender;
        this.app = app;
        this.host = host;
    }

    @Override
    public void enviar(Email email) {
        JavaMailSender sender = host.isBlank() ? null : mailSender.getIfAvailable();
        if (sender == null) {
            if (app.emDesenvolvimento()) {
                log.warn("[DEV] SMTP não configurado. E-mail \"{}\" não enviado. Link: {}", email.assunto(), email.linkPrincipal());
            } else {
                log.warn("SMTP não configurado: e-mail \"{}\" não enviado.", email.assunto());
            }
            return;
        }
        try {
            MimeMessage msg = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, StandardCharsets.UTF_8.name());
            helper.setFrom(app.emailFrom());
            helper.setTo(email.para());
            helper.setSubject(email.assunto());
            helper.setText(email.html(), true);
            sender.send(msg);
        } catch (Exception e) {
            // Não loga o destinatário nem o conteúdo (dados pessoais / links).
            log.error("Falha ao enviar e-mail \"{}\": {}", email.assunto(), e.getClass().getSimpleName());
        }
    }
}
