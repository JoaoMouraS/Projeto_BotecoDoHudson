package com.botecodohudson.api.controller;

import com.botecodohudson.api.dto.EmailDTO;
import com.botecodohudson.api.dto.LoginRequestDTO;
import com.botecodohudson.api.dto.RedefinirSenhaDTO;
import com.botecodohudson.api.dto.TokenDTO;
import com.botecodohudson.api.email.EmailService;
import com.botecodohudson.api.model.TokenEmailModel;
import com.botecodohudson.api.service.EmailTokenService;
import com.botecodohudson.api.dto.PerfilDTO;
import com.botecodohudson.api.model.UsuarioModel;
import com.botecodohudson.api.repository.UsuarioRepository;
import com.botecodohudson.api.security.RateLimiter;
import com.botecodohudson.api.security.SessaoCookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AuthController {

    // Depois de 5 senhas erradas para o mesmo e-mail, bloqueia esse e-mail por 15 min
    // (além do limite por IP do RateLimitFilter).
    private static final int MAX_FALHAS = 5;
    private static final Duration BLOQUEIO = Duration.ofMinutes(15);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessaoCookie sessaoCookie;
    private final RateLimiter rateLimiter;
    private final EmailTokenService emailTokens;
    private final EmailService emailService;
    // Hash de uma senha aleatória: usado quando o e-mail não existe para a resposta
    // demorar o mesmo tempo (não dá para descobrir quais e-mails estão cadastrados).
    private final String hashFalso;

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                          SessaoCookie sessaoCookie, RateLimiter rateLimiter,
                          EmailTokenService emailTokens, EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessaoCookie = sessaoCookie;
        this.rateLimiter = rateLimiter;
        this.emailTokens = emailTokens;
        this.emailService = emailService;
        this.hashFalso = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO dto,
                                   HttpServletRequest request, HttpServletResponse response) {
        String email = dto.email().trim().toLowerCase();
        String chaveFalhas = "login-falhas|" + email;

        if (rateLimiter.bloqueado(chaveFalhas, MAX_FALHAS, BLOQUEIO)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("erro", "Muitas tentativas. Aguarde 15 minutos ou redefina a senha."));
        }

        Optional<UsuarioModel> usuarioOpt = usuarioRepository.findByEmail(email);
        String hash = usuarioOpt.map(UsuarioModel::getSenha).orElse(hashFalso);
        boolean senhaOk = passwordEncoder.matches(dto.senha(), hash);

        // Mesma mensagem para "usuário não existe" e "senha errada".
        if (usuarioOpt.isEmpty() || !senhaOk) {
            rateLimiter.permitir(chaveFalhas, MAX_FALHAS, BLOQUEIO);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", "E-mail ou senha incorretos."));
        }

        rateLimiter.zerar(chaveFalhas);
        UsuarioModel usuario = usuarioOpt.get();
        sessaoCookie.criar(usuario, request, response);
        return ResponseEntity.ok(PerfilDTO.de(usuario));
    }

    /** Clique no link "confirmar e-mail". Deixa logado (o link prova que é o dono do e-mail). */
    @PostMapping("/auth/verificar-email")
    @Transactional
    public ResponseEntity<?> verificarEmail(@Valid @RequestBody TokenDTO dto,
                                            HttpServletRequest request, HttpServletResponse response) {
        return emailTokens.consumir(dto.token(), TokenEmailModel.Tipo.VERIFICAR_EMAIL)
                .<ResponseEntity<?>>map(u -> {
                    u.setEmailVerificado(true);
                    usuarioRepository.save(u);
                    sessaoCookie.criar(u, request, response);
                    return ResponseEntity.ok(PerfilDTO.de(u));
                })
                .orElseGet(() -> ResponseEntity.badRequest()
                        .body(Map.of("erro", "Link inválido ou expirado. Peça um novo pelo seu perfil.")));
    }

    /**
     * "Esqueci a senha": responde SEMPRE a mesma coisa (não revela se o e-mail tem conta).
     * Limite de 3 pedidos por hora por e-mail para ninguém usar isso para lotar a caixa de alguém.
     */
    @PostMapping("/auth/esqueci-senha")
    public ResponseEntity<?> esqueciSenha(@Valid @RequestBody EmailDTO dto) {
        String email = dto.email().trim().toLowerCase();
        if (rateLimiter.permitir("esqueci|" + email, 3, Duration.ofHours(1))) {
            usuarioRepository.findByEmail(email).ifPresent(u -> {
                String token = emailTokens.gerar(u, TokenEmailModel.Tipo.REDEFINIR_SENHA, Duration.ofMinutes(30));
                emailService.redefinirSenha(u.getEmail(), u.getNome(), token);
            });
        }
        return ResponseEntity.accepted().body(Map.of("mensagem",
                "Se houver uma conta com esse e-mail, enviamos um link para criar uma nova senha."));
    }

    /** Define a nova senha pelo link do e-mail. Derruba todas as sessões e já entra logado. */
    @PostMapping("/auth/redefinir-senha")
    @Transactional
    public ResponseEntity<?> redefinirSenha(@Valid @RequestBody RedefinirSenhaDTO dto,
                                            HttpServletRequest request, HttpServletResponse response) {
        return emailTokens.consumir(dto.token(), TokenEmailModel.Tipo.REDEFINIR_SENHA)
                .<ResponseEntity<?>>map(u -> {
                    u.setSenha(passwordEncoder.encode(dto.novaSenha()));
                    u.setTokenVersao(u.getTokenVersao() + 1);
                    u.setEmailVerificado(true); // recebeu o link: o e-mail é dele
                    usuarioRepository.save(u);
                    rateLimiter.zerar("login-falhas|" + u.getEmail());
                    sessaoCookie.criar(u, request, response);
                    return ResponseEntity.ok(PerfilDTO.de(u));
                })
                .orElseGet(() -> ResponseEntity.badRequest()
                        .body(Map.of("erro", "Link inválido ou expirado. Peça um novo.")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        sessaoCookie.apagar(request, response);
        return ResponseEntity.noContent().build();
    }
}
