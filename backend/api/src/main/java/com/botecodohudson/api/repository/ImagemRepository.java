package com.botecodohudson.api.repository;

import com.botecodohudson.api.model.ImagemModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ImagemRepository extends JpaRepository<ImagemModel, UUID> {
}
