package com.botecodohudson.api.repository;

import com.botecodohudson.api.model.EventoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventoRepository extends JpaRepository<EventoModel, Long> {
    List<EventoModel> findByPublicadoTrueAndDataEventoAfterOrderByDataEventoAsc(java.time.LocalDateTime agora);
}
