package com.botecodohudson.api.repository;

import com.botecodohudson.api.model.ConvidadoModel;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConvidadoRepository extends JpaRepository<ConvidadoModel, Long> {

    Optional<ConvidadoModel> findByConfirmacaoHash(String hash);

    @EntityGraph(attributePaths = {"reserva", "reserva.usuario", "reserva.evento"})
    Optional<ConvidadoModel> findByCodigoIngresso(String codigo);

    /** Ingressos de quem tem conta: retirados logado OU com o mesmo e-mail (já verificado). */
    @EntityGraph(attributePaths = {"reserva", "reserva.usuario", "reserva.evento"})
    @Query("select c from ConvidadoModel c where c.confirmadoEm is not null "
            + "and (c.usuario.id = :usuarioId or lower(c.email) = :email) order by c.reserva.dataReserva desc")
    List<ConvidadoModel> ingressosDoUsuario(@Param("usuarioId") Long usuarioId, @Param("email") String email);

    boolean existsByCodigoIngresso(String codigo);
}
