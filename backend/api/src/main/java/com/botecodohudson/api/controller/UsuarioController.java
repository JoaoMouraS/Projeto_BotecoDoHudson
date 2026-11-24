package com.botecodohudson.api.controller;

import com.botecodohudson.api.dto.ConfirmarSenhaDTO;
import com.botecodohudson.api.dto.IngressoDTO;
import com.botecodohudson.api.dto.PerfilAtualizacaoDTO;
import com.botecodohudson.api.dto.PerfilDTO;
import com.botecodohudson.api.dto.UsuarioCadastroDTO;
import com.botecodohudson.api.email.EmailService;
import com.botecodohudson.api.model.TokenEmailModel;
import com.botecodohudson.api.model.UsuarioModel;
import com.botecodohudson.api.repository.UsuarioRepository;
import com.botecodohudson.api.security.SessaoCookie;
import com.botecodohudson.api.service.ConviteService;
import com.botecodohudson.api.service.EmailTokenService;
import com.botecodohudson.api.service.ImagemService;
import com.botecodohudson.api.util.Telefones;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessaoCookie sessaoCookie;
    private final EmailTokenService emailTokens;
    private final EmailService emailService;
    private final ImagemService imagemService;
    private final ConviteService conviteService;

    public UsuarioController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                             SessaoCookie sessaoCookie, EmailTokenService emailTokens, EmailService emailService,
                             ImagemService imagemService, ConviteService conviteService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessaoCookie = sessaoCookie;
        this.emailTokens = emailTokens;
        this.emailService = emailService;
        this.imagemService = imagemService;
        this.conviteService = conviteService;
    }

    /**
     * Cria a conta (sempre USER), já deixa logado e envia o link de confirmação de e-mail.
     * Até confirmar, o usuário navega normalmente mas não consegue reservar.
     */
    @PostMapping("/cadastrar")
    @Transactional
    public ResponseEntity<?> cadastrar(@Valid @RequestBody UsuarioCadastroDTO dto,
                                       HttpServletRequest request, HttpServletResponse response) {
        String email = dto.email().trim().toLowerCase();
        if (usuarioRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("erro", "Este e-mail já está em uso."));
        }

        UsuarioModel novo = new UsuarioModel();
        novo.setNome(dto.nome().trim());
        novo.setEmail(email);
        novo.setSenha(passwordEncoder.encode(dto.senha())); // BCrypt, nunca a senha pura
        novo.setTelefone(telefoneOpcional(dto.telefone()));
        novo.setRole("USER"); // Admin só é criado pelo AdminSeeder.
        novo.setEmailVerificado(false);

        try {
            usuarioRepository.saveAndFlush(novo);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("erro", "Este e-mail já está em uso."));
        }

        enviarVerificacao(novo);
        sessaoCookie.criar(novo, request, response);
        return ResponseEntity.status(HttpStatus.CREATED).body(PerfilDTO.de(novo));
    }

    /** Dados do usuário logado. Visitante recebe 204 (sem conteúdo), não erro. */
    @GetMapping("/me")
    public ResponseEntity<PerfilDTO> meuPerfil(@AuthenticationPrincipal UsuarioModel usuario) {
        return usuario == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(PerfilDTO.de(usuario));
    }

    @PutMapping("/me")
    @Transactional
    public PerfilDTO atualizarPerfil(@AuthenticationPrincipal UsuarioModel usuario,
                                     @Valid @RequestBody PerfilAtualizacaoDTO dto) {
        usuario.setNome(dto.nome().trim());
        usuario.setTelefone(telefoneOpcional(dto.telefone()));
        usuario.setDataNascimento(dto.dataNascimento());
        return PerfilDTO.de(usuarioRepository.save(usuario));
    }

    @PostMapping("/me/reenviar-verificacao")
    @Transactional
    public ResponseEntity<?> reenviarVerificacao(@AuthenticationPrincipal UsuarioModel usuario) {
        if (Boolean.TRUE.equals(usuario.getEmailVerificado())) {
            return ResponseEntity.ok(Map.of("mensagem", "Seu e-mail já está confirmado."));
        }
        enviarVerificacao(usuario);
        return ResponseEntity.accepted().body(Map.of("mensagem", "Enviamos um novo link para " + usuario.getEmail() + "."));
    }

    /**
     * Troca de senha pelo perfil: em vez de digitar a senha atual aqui, o usuário recebe
     * um link no e-mail (quem roubou a sessão não consegue trocar a senha sem o e-mail).
     */
    @PostMapping("/me/senha/link")
    @Transactional
    public ResponseEntity<?> linkTrocarSenha(@AuthenticationPrincipal UsuarioModel usuario) {
        String token = emailTokens.gerar(usuario, TokenEmailModel.Tipo.REDEFINIR_SENHA, Duration.ofMinutes(30));
        emailService.redefinirSenha(usuario.getEmail(), usuario.getNome(), token);
        return ResponseEntity.accepted().body(Map.of("mensagem",
                "Enviamos para " + usuario.getEmail() + " um link para criar a nova senha. Ele vale por 30 minutos."));
    }

    /** Foto de perfil (aparece no link de convite das suas reservas). */
    @PostMapping(value = "/me/foto", consumes = "multipart/form-data")
    @Transactional
    public PerfilDTO enviarFoto(@AuthenticationPrincipal UsuarioModel usuario, @RequestParam("arquivo") MultipartFile arquivo) {
        UUID antiga = usuario.getFotoId();
        usuario.setFotoId(imagemService.salvar(arquivo, usuario.getId(), 512));
        usuarioRepository.saveAndFlush(usuario);
        imagemService.apagar(antiga);
        return PerfilDTO.de(usuario);
    }

    @DeleteMapping("/me/foto")
    @Transactional
    public PerfilDTO removerFoto(@AuthenticationPrincipal UsuarioModel usuario) {
        UUID antiga = usuario.getFotoId();
        usuario.setFotoId(null);
        usuarioRepository.saveAndFlush(usuario);
        imagemService.apagar(antiga);
        return PerfilDTO.de(usuario);
    }

    /** Ingressos que a pessoa retirou em reservas de amigos. */
    @GetMapping("/me/ingressos")
    public List<IngressoDTO> meusIngressos(@AuthenticationPrincipal UsuarioModel usuario) {
        return conviteService.meusIngressos(usuario);
    }

    /** LGPD: o usuário pode apagar a própria conta (e suas reservas) a qualquer momento. */
    @DeleteMapping("/me")
    @Transactional
    public ResponseEntity<?> excluirConta(@AuthenticationPrincipal UsuarioModel usuario,
                                          @Valid @RequestBody ConfirmarSenhaDTO dto,
                                          HttpServletRequest request, HttpServletResponse response) {
        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", "Senha incorreta."));
        }
        if (usuario.isAdmin()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("erro", "A conta de administrador não pode ser excluída por aqui."));
        }
        usuarioRepository.delete(usuario);
        sessaoCookie.apagar(request, response);
        return ResponseEntity.noContent().build();
    }

    private void enviarVerificacao(UsuarioModel u) {
        String token = emailTokens.gerar(u, TokenEmailModel.Tipo.VERIFICAR_EMAIL, Duration.ofHours(24));
        emailService.verificarEmail(u.getEmail(), u.getNome(), token);
    }

    private static String telefoneOpcional(String telefone) {
        if (telefone == null || telefone.isBlank()) return null;
        String normalizado = Telefones.normalizar(telefone);
        if (normalizado == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um WhatsApp válido com DDD.");
        }
        return normalizado;
    }
}
