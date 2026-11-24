package com.botecodohudson.api.repository;

import com.botecodohudson.api.model.EventoModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventoRepository extends JpaRepository<EventoModel, Long> {

    List<EventoModel> findByCanceladoFalseAndDataInicioGreaterThanEqualOrderByDataInicioAsc(LocalDateTime desde);

    List<EventoModel> findByCanceladoFalseAndDataInicioBetween(LocalDateTime inicio, LocalDateTime fim);

    Optional<EventoModel> findByIdExterno(String idExterno);
}
