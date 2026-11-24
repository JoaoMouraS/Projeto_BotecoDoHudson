package com.botecodohudson.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "imagens")
public class ImagemModel {

    @Id
    private UUID id;

    @Column(nullable = false)
    private Long donoId;

    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] conteudo;

    @Column(nullable = false, length = 40)
    private String tipo;
}
