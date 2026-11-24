package com.botecodohudson.api.repository;

import com.botecodohudson.api.model.ReservaModel;
import com.botecodohudson.api.model.StatusReserva;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<ReservaModel, Long> {

    List<StatusReserva> ATIVOS = List.of(StatusReserva.AGUARDANDO_CONVIDADOS, StatusReserva.CONFIRMADA);

    @EntityGraph(attributePaths = {"convidados", "evento"})
    List<ReservaModel> findByUsuarioIdOrderByDataReservaDesc(Long usuarioId);

    @EntityGraph(attributePaths = {"convidados", "evento", "usuario"})
    List<ReservaModel> findAllByOrderByDataReservaDesc();

    @EntityGraph(attributePaths = {"convidados", "evento", "usuario"})
    Optional<ReservaModel> findByCodigoConvite(String codigoConvite);

    /**
     * Trava a linha da reserva enquanto um convidado é adicionado, para dois amigos
     * confirmando ao mesmo tempo não estourarem o limite de vagas.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from ReservaModel r where r.codigoConvite = :codigo")
    Optional<ReservaModel> travarPorCodigo(@Param("codigo") String codigo);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from ReservaModel r where r.idReserva = :id")
    Optional<ReservaModel> travarPorId(@Param("id") Long id);

    long countByUsuarioIdAndStatusInAndDataReservaAfter(Long usuarioId, Collection<StatusReserva> status, LocalDateTime depoisDe);

    long countByEventoIdAndStatusIn(Long eventoId, Collection<StatusReserva> status);

    boolean existsByUsuarioIdAndEventoIdAndStatusIn(Long usuarioId, Long eventoId, Collection<StatusReserva> status);

    @Query("select count(r) > 0 from ReservaModel r where r.exclusiva = true and r.status in :status "
            + "and r.dataReserva >= :inicio and r.dataReserva < :fim")
    boolean existeExclusivaNoDia(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim,
                                 @Param("status") Collection<StatusReserva> status);

    /** Reservas de evento sem check-in cujo horário limite já passou. */
    List<ReservaModel> findByStatusInAndExclusivaFalseAndEventoIsNotNullAndCheckInEmIsNullAndDataReservaBefore(
            Collection<StatusReserva> status, LocalDateTime agora);

    boolean existsByCodigoConvite(String codigoConvite);
}
