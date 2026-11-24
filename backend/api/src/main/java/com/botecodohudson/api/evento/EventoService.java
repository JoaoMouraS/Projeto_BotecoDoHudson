package com.botecodohudson.api.evento;

import com.botecodohudson.api.config.ReservaRegras;
import com.botecodohudson.api.model.EventoModel;
import com.botecodohudson.api.repository.EventoRepository;
import com.botecodohudson.api.repository.ReservaRepository;
import com.botecodohudson.api.util.Horario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class EventoService {

    private static final Logger log = LoggerFactory.getLogger(EventoService.class);

    private final EventoRepository eventos;
    private final ReservaRepository reservas;
    private final SymplaClient sympla;
    private final ReservaRegras regras;

    public EventoService(EventoRepository eventos, ReservaRepository reservas, SymplaClient sympla, ReservaRegras regras) {
        this.eventos = eventos;
        this.reservas = reservas;
        this.sympla = sympla;
        this.regras = regras;
    }

    /** Eventos de hoje em diante, com mesas disponíveis. */
    @Transactional(readOnly = true)
    public List<EventoDTO> futuros() {
        LocalDateTime hoje = LocalDate.now(Horario.FUSO).atStartOfDay();
        return eventos.findByCanceladoFalseAndDataInicioGreaterThanEqualOrderByDataInicioAsc(hoje)
                .stream().map(this::dto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<EventoModel> doDia(LocalDate dia) {
        return eventos.findByCanceladoFalseAndDataInicioBetween(dia.atStartOfDay(), dia.atTime(LocalTime.MAX))
                .stream().findFirst();
    }

    public EventoDTO dto(EventoModel e) {
        long ocupadas = reservas.countByEventoIdAndStatusIn(e.getId(), ReservaRepository.ATIVOS);
        int livres = (int) Math.max(0, regras.mesasPorEvento() - ocupadas);
        return EventoDTO.de(e, livres, livres > 0 && limiteDeChegada(e).isAfter(Horario.agora()));
    }

    /** No dia do evento a mesa fica segurada até o horário limite (ex.: 20h). */
    public LocalDateTime limiteDeChegada(EventoModel e) {
        return e.getDataInicio().toLocalDate().atTime(LocalTime.parse(regras.horarioLimiteChegada()));
    }

    @Transactional
    public EventoDTO criarManual(EventoManualDTO dto) {
        EventoModel e = new EventoModel();
        e.setFonte(EventoModel.Fonte.MANUAL);
        e.setNome(dto.nome().trim());
        e.setDescricao(dto.descricao());
        e.setDataInicio(dto.dataInicio());
        e.setImagemUrl(vazioParaNull(dto.imagemUrl()));
        e.setUrl(vazioParaNull(dto.url()));
        return dto(eventos.save(e));
    }

    /** Esconde o evento do site (manual ou do Sympla). Reservas existentes continuam. */
    @Transactional
    public void cancelar(Long id) {
        EventoModel e = eventos.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        e.setCancelado(true);
        e.setAtualizadoEm(Instant.now());
    }

    /** Puxa os eventos do Sympla a cada 30 min (só se SYMPLA_TOKEN estiver configurado). */
    @Scheduled(initialDelayString = "PT15S", fixedDelayString = "PT30M")
    @Transactional
    public void sincronizarSympla() {
        if (!sympla.configurado()) return;
        try {
            for (SymplaClient.EventoSympla s : sympla.eventosFuturos()) {
                if (s.id() == null || s.nome() == null || s.inicio() == null || s.privado()) continue;
                EventoModel e = eventos.findByIdExterno(s.id()).orElseGet(() -> {
                    EventoModel novo = new EventoModel();
                    novo.setFonte(EventoModel.Fonte.SYMPLA);
                    novo.setIdExterno(s.id());
                    return novo;
                });
                e.setNome(limitar(s.nome(), 200));
                e.setDescricao(s.descricao());
                e.setDataInicio(s.inicio());
                e.setImagemUrl(https(s.imagem()));
                e.setUrl(https(s.url()));
                // Cancelado no Sympla → some do site. (Cancelado manualmente aqui continua escondido.)
                if (s.cancelado() || !s.publicado()) e.setCancelado(true);
                e.setAtualizadoEm(Instant.now());
                eventos.save(e);
            }
        } catch (Exception ex) {
            // Falha no Sympla não derruba o site: continua com os eventos já salvos.
            log.warn("Não foi possível sincronizar eventos do Sympla: {}", ex.getClass().getSimpleName());
        }
    }

    private static String https(String url) {
        return url != null && url.startsWith("https://") && url.length() <= 500 ? url : null;
    }

    private static String limitar(String s, int max) {
        return s.length() > max ? s.substring(0, max) : s;
    }

    private static String vazioParaNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }
}
