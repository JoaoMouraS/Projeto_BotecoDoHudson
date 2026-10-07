package com.botecodohudson.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.JoinColumn;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "eventos")
public class EventoModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    private String descricao;

    @NotNull
    @Future
    @Column(nullable = false)
    private LocalDateTime dataEvento;

    @NotBlank
    @Column(nullable = false)
    private String local;

    @NotNull
    @Column(nullable = false)
    private BigDecimal precoIngresso;

    private String imagemUrl;
    private String symplaUrl;
    private boolean publicado = true;

    @ElementCollection
    @CollectionTable(name = "evento_imagens", joinColumns = @JoinColumn(name = "evento_id"))
    @Column(name = "imagem_url")
    private List<String> imagensUrls = new ArrayList<>();

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public LocalDateTime getDataEvento() { return dataEvento; }
    public void setDataEvento(LocalDateTime dataEvento) { this.dataEvento = dataEvento; }
    public String getLocal() { return local; }
    public void setLocal(String local) { this.local = local; }
    public BigDecimal getPrecoIngresso() { return precoIngresso; }
    public void setPrecoIngresso(BigDecimal precoIngresso) { this.precoIngresso = precoIngresso; }
    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }
    public String getSymplaUrl() { return symplaUrl; }
    public void setSymplaUrl(String symplaUrl) { this.symplaUrl = symplaUrl; }
    public boolean isPublicado() { return publicado; }
    public void setPublicado(boolean publicado) { this.publicado = publicado; }
    public List<String> getImagensUrls() { return imagensUrls; }
    public void setImagensUrls(List<String> imagensUrls) { this.imagensUrls = imagensUrls == null ? new ArrayList<>() : imagensUrls; }
}
