package com.botecodohudson.api.service;

import com.botecodohudson.api.config.ReservaRegras;
import com.botecodohudson.api.dto.DisponibilidadeDTO;
import com.botecodohudson.api.dto.ReservaRequestDTO;
import com.botecodohudson.api.dto.ReservaResponseDTO;
import com.botecodohudson.api.email.EmailService;
import com.botecodohudson.api.evento.EventoService;
import com.botecodohudson.api.model.EventoModel;
import com.botecodohudson.api.model.ReservaModel;
import com.botecodohudson.api.model.StatusReserva;
import com.botecodohudson.api.model.UsuarioModel;
import com.botecodohudson.api.repository.EventoRepository;
import com.botecodohudson.api.repository.ReservaRepository;
import com.botecodohudson.api.util.Datas;
import com.botecodohudson.api.util.Horario;
import com.botecodohudson.api.util.Telefones;
import com.botecodohudson.api.util.Tokens;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReservaService {

    private static final Logger log = LoggerFactory.getLogger(ReservaService.class);
    private static final int TAMANHO_CODIGO = 12; // ~59 bits: impossível de adivinhar

    private final ReservaRepository reservaRepository;
    private final EventoRepository eventoRepository;
    private final EventoService eventoService;
    private final ImagemService imagemService;
    private final EmailService emailService;
    private final ReservaRegras regras;

    public ReservaService(ReservaRepository reservaRepository, EventoRepository eventoRepository,
                          EventoService eventoService, ImagemService imagemService, EmailService emailService,
                          ReservaRegras regras) {
        this.reservaRepository = reservaRepository;
        this.eventoRepository = eventoRepository;
        this.eventoService = eventoService;
        this.imagemService = imagemService;
        this.emailService = emailService;
        this.regras = regras;
    }

    /** O que dá para fazer num dia: reservar pelo evento ou fechar a casa (exclusiva). */
    @Transactional(readOnly = true)
    public DisponibilidadeDTO disponibilidade(LocalDate dia) {
        var evento = eventoService.doDia(dia);
        if (evento.isPresent()) {
            return new DisponibilidadeDTO(dia, eventoService.dto(evento.get()), false, "Esse dia tem evento.");
        }
        String motivo = motivoExclusivaIndisponivel(dia);
        return new DisponibilidadeDTO(dia, null, motivo == null, motivo);
    }

    @Transactional
    public ReservaResponseDTO criarReserva(ReservaRequestDTO dto, UsuarioModel dono) {
        if (!Boolean.TRUE.equals(dono.getEmailVerificado())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Confirme seu e-mail antes de reservar. Reenvie o link pelo seu perfil.");
        }
        String telefone = Telefones.normalizar(dto.telefone());
        if (telefone == null) throw erro("Informe um WhatsApp válido com DDD.");

        LocalDateTime agora = Horario.agora();
        long ativas = reservaRepository.countByUsuarioIdAndStatusInAndDataReservaAfter(
                dono.getId(), ReservaRepository.ATIVOS, agora);
        if (ativas >= regras.reservasAtivasPorUsuario()) {
            throw erro("Você já tem " + ativas + " reservas ativas. Cancele uma para criar outra.");
        }

        ReservaModel reserva = new ReservaModel();
        int pessoas = dto.quantidadePessoas();

        if (dto.eventoId() != null) {
            // ---------------- reserva para um evento
            EventoModel evento = eventoRepository.findById(dto.eventoId())
                    .filter(e -> !Boolean.TRUE.equals(e.getCancelado()))
                    .orElseThrow(() -> erro("Evento não encontrado."));
            LocalDateTime limite = eventoService.limiteDeChegada(evento);
            if (!limite.isAfter(agora)) throw erro("As reservas para este evento já encerraram.");
            exigirFaixa(pessoas, regras.minimoPessoas(), regras.maximoPessoas());
            if (reservaRepository.existsByUsuarioIdAndEventoIdAndStatusIn(dono.getId(), evento.getId(), ReservaRepository.ATIVOS)) {
                throw erro("Você já tem uma reserva para este evento.");
            }
            if (reservaRepository.countByEventoIdAndStatusIn(evento.getId(), ReservaRepository.ATIVOS) >= regras.mesasPorEvento()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "As mesas para este evento esgotaram.");
            }
            reserva.setEvento(evento);
            reserva.setExclusiva(false);
            reserva.setDataReserva(limite);
            reserva.setMetaMinima(regras.minimoPessoas());
        } else if (Boolean.TRUE.equals(dto.exclusiva())) {
            // ---------------- casa exclusiva num dia sem evento
            if (dto.data() == null) throw erro("Escolha a data.");
            String motivo = motivoExclusivaIndisponivel(dto.data());
            if (motivo != null) throw new ResponseStatusException(HttpStatus.CONFLICT, motivo);
            exigirFaixa(pessoas, regras.minimoPessoasExclusiva(), regras.maximoPessoasExclusiva());
            reserva.setExclusiva(true);
            reserva.setDataReserva(dto.data().atTime(limiteChegada()));
            reserva.setMetaMinima(regras.minimoPessoasExclusiva());
        } else {
            throw erro("Escolha um evento, ou uma data sem evento para reservar a casa.");
        }

        reserva.setUsuario(dono);
        reserva.setNomeCliente(dto.nomeCliente().trim());
        reserva.setTelefone(telefone);
        reserva.setQuantidadePessoas(pessoas);
        reserva.setAniversario(Boolean.TRUE.equals(dto.aniversario()));
        reserva.setMensagem(dto.mensagem() == null || dto.mensagem().isBlank() ? null : dto.mensagem().trim());
        reserva.setCodigoConvite(gerarCodigoUnico());
        reserva.atualizarStatus();

        try {
            reserva = reservaRepository.saveAndFlush(reserva);
        } catch (DataIntegrityViolationException e) {
            // Índice único: outra pessoa fechou a casa nesse dia ao mesmo tempo.
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Essa data acabou de ser reservada por outra pessoa.");
        }

        emailService.reservaCriada(dono.getEmail(), dono.getNome(), Datas.descrever(reserva),
                reserva.getCodigoConvite(), reserva.getMetaMinima());
        return ReservaResponseDTO.de(reserva);
    }

    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarTodas() {
        return reservaRepository.findAllByOrderByDataReservaDesc().stream().map(ReservaResponseDTO::de).toList();
    }

    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarDoUsuario(UsuarioModel usuario) {
        return reservaRepository.findByUsuarioIdOrderByDataReservaDesc(usuario.getId()).stream()
                .map(ReservaResponseDTO::de).toList();
    }

    /** Cancela uma reserva. Só o dono ou um ADMIN podem cancelar. */
    @Transactional
    public ReservaResponseDTO cancelar(Long id, UsuarioModel solicitante) {
        ReservaModel reserva = buscarComPermissao(id, solicitante);
        if (reserva.getStatus().ativa()) reserva.setStatus(StatusReserva.CANCELADA);
        return ReservaResponseDTO.de(reserva);
    }

    /** Anfitrião (ou admin) tira um convidado da lista — ex.: alguém que entrou por engano. */
    @Transactional
    public ReservaResponseDTO removerConvidado(Long reservaId, Long convidadoId, UsuarioModel solicitante) {
        ReservaModel reserva = buscarComPermissao(reservaId, solicitante);
        boolean removido = reserva.getConvidados().removeIf(c -> c.getId().equals(convidadoId));
        if (!removido) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        reserva.atualizarStatus();
        return ReservaResponseDTO.de(reserva);
    }

    /** Foto de capa do link (ex.: aniversário). Substitui a anterior. */
    @Transactional
    public ReservaResponseDTO definirCapa(Long id, MultipartFile arquivo, UsuarioModel solicitante) {
        ReservaModel reserva = buscarComPermissao(id, solicitante);
        if (!reserva.getStatus().ativa()) throw erro("Esta reserva não está mais ativa.");
        UUID antiga = reserva.getCapaId();
        reserva.setCapaId(imagemService.salvar(arquivo, solicitante.getId(), 1600));
        reservaRepository.flush();
        imagemService.apagar(antiga);
        return ReservaResponseDTO.de(reserva);
    }

    /** Admin marca que o grupo chegou (a mesa não é mais liberada às 20h). */
    @Transactional
    public ReservaResponseDTO checkIn(Long id, UsuarioModel admin) {
        ReservaModel reserva = buscarComPermissao(id, admin);
        if (!reserva.getStatus().ativa()) throw erro("Reserva não está ativa.");
        reserva.setCheckInEm(Instant.now());
        return ReservaResponseDTO.de(reserva);
    }

    /**
     * Dias de evento: depois do horário limite (20h), reservas sem check-in são
     * liberadas (EXPIRADA). Roda a cada 5 minutos.
     */
    @Scheduled(initialDelayString = "PT30S", fixedDelayString = "PT5M")
    @Transactional
    public int liberarMesasSemCheckIn() {
        List<ReservaModel> vencidas = reservaRepository
                .findByStatusInAndExclusivaFalseAndEventoIsNotNullAndCheckInEmIsNullAndDataReservaBefore(
                        ReservaRepository.ATIVOS, Horario.agora());
        vencidas.forEach(r -> r.setStatus(StatusReserva.EXPIRADA));
        if (!vencidas.isEmpty()) log.info("{} reserva(s) sem check-in liberada(s).", vencidas.size());
        return vencidas.size();
    }

    // ---------------------------------------------------------------- apoio

    private String motivoExclusivaIndisponivel(LocalDate dia) {
        LocalDate hoje = LocalDate.now(Horario.FUSO);
        if (dia.isBefore(hoje.plusDays(regras.diasMinimosExclusiva()))) {
            return "Para fechar a casa, reserve com pelo menos " + regras.diasMinimosExclusiva() + " dias de antecedência.";
        }
        if (dia.isAfter(hoje.plusDays(regras.diasAntecedenciaMaxima()))) {
            return "Reservas só com até " + regras.diasAntecedenciaMaxima() + " dias de antecedência.";
        }
        if (eventoService.doDia(dia).isPresent()) {
            return "Esse dia tem evento: reserve sua mesa pelo evento.";
        }
        if (reservaRepository.existeExclusivaNoDia(dia.atStartOfDay(), dia.plusDays(1).atStartOfDay(), ReservaRepository.ATIVOS)) {
            return "Essa data já está reservada para outro grupo.";
        }
        return null;
    }

    private LocalTime limiteChegada() {
        return LocalTime.parse(regras.horarioLimiteChegada());
    }

    private static void exigirFaixa(int pessoas, int min, int max) {
        if (pessoas < min || pessoas > max) {
            throw erro("A reserva precisa ser para " + min + " a " + max + " pessoas.");
        }
    }

    private ReservaModel buscarComPermissao(Long id, UsuarioModel solicitante) {
        ReservaModel reserva = reservaRepository.travarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        boolean isDono = reserva.getUsuario().getId().equals(solicitante.getId());
        if (!isDono && !solicitante.isAdmin()) {
            // 404 em vez de 403 para não revelar que a reserva de outra pessoa existe.
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return reserva;
    }

    private String gerarCodigoUnico() {
        for (int tentativa = 0; tentativa < 5; tentativa++) {
            String codigo = Tokens.codigo(TAMANHO_CODIGO);
            if (!reservaRepository.existsByCodigoConvite(codigo)) return codigo;
        }
        throw new IllegalStateException("Não foi possível gerar código de convite.");
    }

    static ResponseStatusException erro(String mensagem) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
    }
}
