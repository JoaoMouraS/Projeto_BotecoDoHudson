package com.botecodohudson.api.controller;

import com.botecodohudson.api.repository.ImagemRepository;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.UUID;

/** Serve as fotos (sempre JPEG re-codificado pelo backend). */
@RestController
public class ImagemController {

    private final ImagemRepository repo;

    public ImagemController(ImagemRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/api/imagens/{id}")
    public ResponseEntity<byte[]> ver(@PathVariable String id) {
        UUID uuid;
        try {
            uuid = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
        return repo.findById(uuid)
                .map(img -> ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        // Cada upload gera um id novo, então pode guardar em cache "para sempre".
                        .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                        .header("X-Content-Type-Options", "nosniff")
                        .header("Content-Disposition", "inline")
                        .body(img.getConteudo()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
