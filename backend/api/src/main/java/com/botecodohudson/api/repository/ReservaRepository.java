package com.botecodohudson.api.repository;

import com.botecodohudson.api.model.ReservaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservaRepository extends JpaRepository<ReservaModel, Long> {
}
