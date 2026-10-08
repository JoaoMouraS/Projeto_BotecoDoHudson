package com.botecodohudson.api.repository;

import com.botecodohudson.api.model.EventoModel;
import com.botecodohudson.api.model.IngressoModel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IngressoRepository extends JpaRepository<IngressoModel, Long> {
    List<IngressoModel> findByEvento(EventoModel evento);
}