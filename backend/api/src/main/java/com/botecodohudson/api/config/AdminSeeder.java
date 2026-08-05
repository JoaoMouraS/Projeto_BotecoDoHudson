package com.botecodohudson.api.config;

import com.botecodohudson.api.model.UsuarioModel;
import com.botecodohudson.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Puxa os valores do application.properties
    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.senha}")
    private String adminSenha;

    @Override
    public void run(String... args) throws Exception {
        // Verifica se a senha foi injetada pelas variáveis de ambiente
        if (adminSenha == null || adminSenha.isEmpty()) {
            System.out.println("Atenção: Senha do admin não configurada nas variáveis de ambiente. Pulando criação.");
            return;
        }

        if (usuarioRepository.findByEmail(adminEmail).isEmpty()) {
            UsuarioModel admin = new UsuarioModel();
            admin.setNome("Administrador Hudson");
            admin.setEmail(adminEmail);
            // Criptografa a senha que veio da variável de ambiente
            admin.setSenha(passwordEncoder.encode(adminSenha)); 
            admin.setRole("ADMIN");

            usuarioRepository.save(admin);
            System.out.println("Usuário Admin criado com sucesso!");
        }
    }
}