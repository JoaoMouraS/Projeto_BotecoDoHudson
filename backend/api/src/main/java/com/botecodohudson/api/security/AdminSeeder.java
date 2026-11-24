package com.botecodohudson.api.security;

import com.botecodohudson.api.model.UsuarioModel;
import com.botecodohudson.api.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminSenha;

    // Valores vêm SOMENTE de ADMIN_EMAIL / ADMIN_PASSWORD (sem padrão no código).
    public AdminSeeder(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       @Value("${app.admin.email:}") String adminEmail,
                       @Value("${app.admin.senha:}") String adminSenha) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail == null ? "" : adminEmail.trim().toLowerCase();
        this.adminSenha = adminSenha;
    }

    @Override
    public void run(String... args) {
        if (adminEmail.isEmpty() || adminSenha == null || adminSenha.isEmpty()) {
            log.info("ADMIN_EMAIL/ADMIN_PASSWORD não definidos: nenhum admin inicial será criado.");
            return;
        }
        if (adminSenha.length() < 12) {
            log.warn("ADMIN_PASSWORD muito curta (mínimo 12 caracteres): admin inicial NÃO criado.");
            return;
        }

        if (usuarioRepository.findByEmail(adminEmail).isEmpty()) {
            UsuarioModel admin = new UsuarioModel();
            admin.setNome("Administrador Hudson");
            admin.setEmail(adminEmail);
            admin.setSenha(passwordEncoder.encode(adminSenha));
            admin.setRole("ADMIN");
            usuarioRepository.save(admin);
            // Nunca loga e-mail nem senha.
            log.info("Usuário admin inicial criado.");
        }
    }
}
