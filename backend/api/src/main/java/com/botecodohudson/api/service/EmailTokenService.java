package com.botecodohudson.api.service;

import com.botecodohudson.api.model.TokenEmailModel;
import com.botecodohudson.api.model.UsuarioModel;
import com.botecodohudson.api.repository.TokenEmailRepository;
import com.botecodohudson.api.util.Tokens;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

/** Links de uso único enviados por e-mail. No banco fica só o hash do token. */
@Service
public class EmailTokenService {

    private final TokenEmailRepository repo;

    public EmailTokenService(TokenEmailRepository repo) {
        this.repo = repo;
    }

    /** Gera um novo token (invalida os anteriores do mesmo tipo) e devolve o valor em claro para o link. */
    @Transactional
    public String gerar(UsuarioModel usuario, TokenEmailModel.Tipo tipo, Duration validade) {
        Instant agora = Instant.now();
        repo.invalidarAnteriores(usuario.getId(), tipo, agora);
        String token = Tokens.novoToken();
        TokenEmailModel t = new TokenEmailModel();
        t.setUsuario(usuario);
        t.setTipo(tipo);
        t.setHash(Tokens.sha256(token));
        t.setExpiraEm(agora.plus(validade));
        repo.save(t);
        return token;
    }

    /** Valida e "queima" o token. Vazio se inválido, expirado, já usado ou de outro tipo. */
    @Transactional
    public Optional<UsuarioModel> consumir(String token, TokenEmailModel.Tipo tipo) {
        if (token == null || token.length() < 20 || token.length() > 100) return Optional.empty();
        Instant agora = Instant.now();
        return repo.findByHash(Tokens.sha256(token))
                .filter(t -> t.getTipo() == tipo && t.getUsadoEm() == null && t.getExpiraEm().isAfter(agora))
                .map(t -> {
                    t.setUsadoEm(agora);
                    return t.getUsuario();
                });
    }
}
