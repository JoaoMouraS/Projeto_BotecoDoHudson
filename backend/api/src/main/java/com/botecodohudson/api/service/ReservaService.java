package com.botecodohudson.api.service;

import com.botecodohudson.api.model.ReservaModel;
import com.botecodohudson.api.repository.ReservaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.botecodohudson.api.repository.EventoRepository;
import com.botecodohudson.api.model.EventoModel;
import com.botecodohudson.api.model.IngressoModel;
import com.botecodohudson.api.repository.IngressoRepository;
import org.springframework.scheduling.annotation.Scheduled;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final EventoRepository eventoRepository;
    private final IngressoRepository ingressoRepository;

    public ReservaService(ReservaRepository reservaRepository, EventoRepository eventoRepository, IngressoRepository ingressoRepository) {
        this.reservaRepository = reservaRepository;
        this.eventoRepository = eventoRepository;
        this.ingressoRepository = ingressoRepository;
    }

    public ReservaModel criarReserva(ReservaModel reserva) {
        validarDataComEvento(reserva.getDataReserva());
        reserva.setStatus("PENDENTE");
        reserva.setStatusReserva(true);
        ReservaModel salva = reservaRepository.save(reserva);
        EventoModel evento = eventoRepository.findByPublicadoTrueAndDataEventoAfterOrderByDataEventoAsc(
            reserva.getDataReserva().minusNanos(1)).stream()
            .filter(item -> item.getDataEvento().toLocalDate().equals(reserva.getDataReserva().toLocalDate()))
            .findFirst().orElseThrow();
        IngressoModel ingresso = new IngressoModel();
        ingresso.setEvento(evento);
        ingresso.setNome("Reserva de mesa #" + salva.getIdReserva());
        ingresso.setPublicoAlvo("RESERVA");
        ingresso.setPreco(java.math.BigDecimal.ZERO);
        ingresso.setQuantidadeTotal(reserva.getQuantidadePessoas());
        ingresso.setQuantidadeVendida(reserva.getQuantidadePessoas());
        ingresso.setValidoAte(evento.getDataEvento());
        ingresso.setEncerraVendasEm(reserva.getDataReserva());
        ingressoRepository.save(ingresso);
        return salva;
    }

    private void validarDataComEvento(java.time.LocalDateTime dataReserva) {
        if (dataReserva == null || dataReserva.toLocalDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("A reserva deve ser feita para hoje ou uma data futura.");
        }
        boolean existeEvento = eventoRepository
                .findByPublicadoTrueAndDataEventoAfterOrderByDataEventoAsc(LocalDate.now().atStartOfDay().minusNanos(1))
                .stream()
                .anyMatch(evento -> evento.getDataEvento().toLocalDate().equals(dataReserva.toLocalDate()));
        if (!existeEvento) {
            throw new IllegalArgumentException("Só é possível reservar em dias com evento publicado.");
        }
    }

    public List<ReservaModel> listarTodas() {
        return reservaRepository.findAll();
    }

    public Optional<ReservaModel> buscarPorId(Long id) {
        return reservaRepository.findById(id);
    }

    public ReservaModel atualizarReserva(Long id, ReservaModel dados) {
        ReservaModel reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva não encontrada."));

        reserva.setNomeCliente(dados.getNomeCliente());
        reserva.setQuantidadePessoas(dados.getQuantidadePessoas());
        boolean mudouData = !reserva.getDataReserva().equals(dados.getDataReserva());
        reserva.setDataReserva(dados.getDataReserva());
        if (mudouData) {
            validarDataComEvento(reserva.getDataReserva());
        }

        if (dados.getStatus() != null && !dados.getStatus().isBlank()) {
            reserva.setStatus(dados.getStatus().toUpperCase());
            reserva.setStatusReserva(!"CANCELADA".equals(reserva.getStatus())
                    && !"RECUSADA".equals(reserva.getStatus()));
        }

        return reservaRepository.save(reserva);
    }

    public void excluirReserva(Long id) {
        if (!reservaRepository.existsById(id)) {
            throw new IllegalArgumentException("Reserva não encontrada.");
        }
        reservaRepository.deleteById(id);
    }

    @Scheduled(fixedDelay = 60000)
    public void expirarReservasSemChegada() {
        LocalDateTime agora = LocalDateTime.now();
        reservaRepository.findAll().stream()
                .filter(reserva -> reserva.getDataReserva() != null)
                .filter(reserva -> !"CANCELADA".equals(reserva.getStatus()))
                .filter(reserva -> !"RECUSADA".equals(reserva.getStatus()))
                .filter(reserva -> !"EXPIRADA".equals(reserva.getStatus()))
                .filter(reserva -> !"PRESENTE".equals(reserva.getStatus()))
                .filter(reserva -> !agora.isBefore(reserva.getDataReserva().plusHours(1)))
                .forEach(reserva -> {
                    reserva.setStatus("EXPIRADA");
                    reserva.setStatusReserva(false);
                    reservaRepository.save(reserva);
                });
    }
}
