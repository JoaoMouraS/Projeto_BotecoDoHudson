package com.botecodohudson.api.service;

import com.botecodohudson.api.dto.ConviteRequestDTO;
import com.botecodohudson.api.dto.ConviteResumoDTO;
import com.botecodohudson.api.dto.IngressoDTO;
import com.botecodohudson.api.dto.RetiradaConviteDTO;
import com.botecodohudson.api.email.EmailService;
import com.botecodohudson.api.model.ConvidadoModel;
import com.botecodohudson.api.model.ReservaModel;
import com.botecodohudson.api.model.StatusReserva;
import com.botecodohudson.api.model.UsuarioModel;
import com.botecodohudson.api.repository.ConvidadoRepository;
import com.botecodohudson.api.repository.ReservaRepository;
import com.botecodohudson.api.util.Datas;
import com.botecodohudson.api.util.Telefones;
import com.botecodohudson.api.util.Tokens;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Fluxo do link de convite (/convite/{codigo}):
 *  1. o amigo informa nome + e-mail (WhatsApp opcional);
 *  2. recebe um link de confirmação no e-mail — só depois disso conta para a meta
 *     (garante que o e-mail existe e evita gente inflando a lista);
 *  3. ao confirmar, recebe o ingresso por e-mail e ele aparece no perfil de quem
 *     tem conta com esse e-mail.
 * Quem já está logado com e-mail verificado pula o passo 2.
 */
@Service
public class ConviteService {

    private static final Duration VALIDADE_CONFIRMACAO = Duration.ofHours(24);

    private final ReservaRepository reservaRepository;
    private final ConvidadoRepository convidadoRepository;
    private final EmailService emailService;

    public ConviteService(ReservaRepository reservaRepository, ConvidadoRepository convidadoRepository,
                          EmailService emailService) {
        this.reservaRepository = reservaRepository;
        this.convidadoRepository = convidadoRepository;
        this.emailService = emailService;
    }

    @Transactional(readOnly = true)
    public ConviteResumoDTO resumo(String codigo) {
        validarFormato(codigo);
        return ConviteResumoDTO.de(reservaRepository.findByCodigoConvite(codigo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @Transactional
    public RetiradaConviteDTO retirar(String codigo, ConviteRequestDTO dto, UsuarioModel logado) {
        validarFormato(codigo);
        ReservaModel reserva = reservaRepository.travarPorCodigo(codigo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        exigirAberta(reserva);

        boolean contaVerificada = logado != null && Boolean.TRUE.equals(logado.getEmailVerificado());
        String email = contaVerificada ? logado.getEmail() : dto.email().trim().toLowerCase();
        String telefone = null;
        if (dto.telefone() != null && !dto.telefone().isBlank()) {
            telefone = Telefones.normalizar(dto.telefone());
            if (telefone == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um WhatsApp válido com DDD.");
        }

        if (email.equalsIgnoreCase(reserva.getUsuario().getEmail())
                || (telefone != null && telefone.equals(reserva.getTelefone()))) {
            throw conflito("Você é o anfitrião desta reserva: já está contado.");
        }

        Optional<ConvidadoModel> existente = reserva.getConvidados().stream()
                .filter(c -> email.equalsIgnoreCase(c.getEmail())).findFirst();
        if (existente.isPresent() && existente.get().isConfirmado()) {
            throw conflito("Este e-mail já retirou convite para esta reserva.");
        }
        final String tel = telefone;
        if (tel != null && reserva.getConvidados().stream()
                .anyMatch(c -> c.isConfirmado() && tel.equals(c.getTelefone()))) {
            throw conflito("Este WhatsApp já está na lista desta reserva.");
        }

        ConvidadoModel convidado = existente.orElseGet(() -> {
            ConvidadoModel novo = new ConvidadoModel();
            novo.setReserva(reserva);
            novo.setCodigoIngresso(gerarCodigoIngresso());
            reserva.getConvidados().add(novo);
            return novo;
        });
        convidado.setNome(dto.nome().trim());
        convidado.setEmail(email);
        convidado.setTelefone(telefone);

        if (contaVerificada) {
            convidado.setUsuario(logado);
            confirmar(convidado, reserva);
            reservaRepository.saveAndFlush(reserva);
            return new RetiradaConviteDTO("CONFIRMADO", convidado.getCodigoIngresso(), ConviteResumoDTO.de(reserva));
        }

        // E-mail ainda não provado: manda link de confirmação (vale 24h).
        String token = Tokens.novoToken();
        convidado.setConfirmacaoHash(Tokens.sha256(token));
        convidado.setConfirmacaoExpiraEm(Instant.now().plus(VALIDADE_CONFIRMACAO));
        reservaRepository.saveAndFlush(reserva);
        emailService.confirmarConvite(email, convidado.getNome(), reserva.getNomeCliente(), Datas.descrever(reserva), token);
        return new RetiradaConviteDTO("PENDENTE", null, ConviteResumoDTO.de(reserva));
    }

    /** Clique no link do e-mail. Idempotente: clicar de novo devolve o mesmo ingresso. */
    @Transactional
    public RetiradaConviteDTO confirmarPorToken(String token) {
        if (token == null || token.length() < 20 || token.length() > 100) throw linkInvalido();
        ConvidadoModel c = convidadoRepository.findByConfirmacaoHash(Tokens.sha256(token)).orElseThrow(this::linkInvalido);
        ReservaModel reserva = reservaRepository.travarPorId(c.getReserva().getIdReserva()).orElseThrow(this::linkInvalido);

        if (!c.isConfirmado()) {
            if (c.getConfirmacaoExpiraEm() == null || c.getConfirmacaoExpiraEm().isBefore(Instant.now())) {
                throw new ResponseStatusException(HttpStatus.GONE, "Este link expirou. Abra o convite e retire de novo.");
            }
            exigirAberta(reserva);
            confirmar(c, reserva);
            reservaRepository.saveAndFlush(reserva);
        }
        return new RetiradaConviteDTO("CONFIRMADO", c.getCodigoIngresso(), ConviteResumoDTO.de(reserva));
    }

    @Transactional(readOnly = true)
    public IngressoDTO ingresso(String codigo) {
        if (codigo == null || !codigo.matches("^[a-z0-9]{12,32}$")) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return convidadoRepository.findByCodigoIngresso(codigo)
                .filter(ConvidadoModel::isConfirmado)
                .map(IngressoDTO::de)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    /** Ingressos que aparecem no perfil (só para quem já provou que é dono do e-mail). */
    @Transactional(readOnly = true)
    public List<IngressoDTO> meusIngressos(UsuarioModel usuario) {
        if (!Boolean.TRUE.equals(usuario.getEmailVerificado())) return List.of();
        return convidadoRepository.ingressosDoUsuario(usuario.getId(), usuario.getEmail().toLowerCase())
                .stream().map(IngressoDTO::de).toList();
    }

    // ---------------------------------------------------------------- apoio

    private void confirmar(ConvidadoModel c, ReservaModel reserva) {
        StatusReserva antes = reserva.getStatus();
        c.setConfirmadoEm(Instant.now());
        reserva.atualizarStatus();

        String quando = Datas.descrever(reserva);
        String evento = reserva.getEvento() == null ? null : reserva.getEvento().getNome();
        emailService.ingresso(c.getEmail(), c.getNome(), reserva.getNomeCliente(), evento, quando, c.getCodigoIngresso());
        if (antes != StatusReserva.CONFIRMADA && reserva.getStatus() == StatusReserva.CONFIRMADA) {
            UsuarioModel dono = reserva.getUsuario();
            emailService.mesaLiberada(dono.getEmail(), dono.getNome(), quando, Boolean.TRUE.equals(reserva.getExclusiva()));
        }
    }

    private void exigirAberta(ReservaModel reserva) {
        if (reserva.getStatus() == StatusReserva.CANCELADA) throw conflito("Esta reserva foi cancelada.");
        if (reserva.getStatus() == StatusReserva.EXPIRADA || reserva.isPassada()) throw conflito("Esta reserva já aconteceu.");
        if (reserva.isLotada()) throw conflito("A mesa já está completa.");
    }

    private String gerarCodigoIngresso() {
        for (int i = 0; i < 5; i++) {
            String codigo = Tokens.codigo(24);
            if (!convidadoRepository.existsByCodigoIngresso(codigo)) return codigo;
        }
        throw new IllegalStateException("Não foi possível gerar código de ingresso.");
    }

    private static void validarFormato(String codigo) {
        // Rejeita lixo antes de ir ao banco.
        if (codigo == null || !codigo.matches("^[a-z0-9]{8,16}$")) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    private ResponseStatusException linkInvalido() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link de confirmação inválido.");
    }

    private static ResponseStatusException conflito(String mensagem) {
        return new ResponseStatusException(HttpStatus.CONFLICT, mensagem);
    }
}
