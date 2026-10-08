package com.botecodohudson.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ingressos")
public class IngressoModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    private EventoModel evento;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @NotBlank
    @Column(nullable = false)
    private String publicoAlvo;

    @NotNull
    @DecimalMin(value = "0.00")
    @Column(nullable = false)
    private BigDecimal preco;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer quantidadeTotal;

    @Column(nullable = false)
    private Integer quantidadeVendida = 0;

    @Column(nullable = false)
    private LocalDateTime validoAte;

    @Column(nullable = false)
    private LocalDateTime encerraVendasEm;

    public Long getId() { return id; }
    public EventoModel getEvento() { return evento; }
    public void setEvento(EventoModel evento) { this.evento = evento; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getPublicoAlvo() { return publicoAlvo; }
    public void setPublicoAlvo(String publicoAlvo) { this.publicoAlvo = publicoAlvo; }
    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }
    public Integer getQuantidadeTotal() { return quantidadeTotal; }
    public void setQuantidadeTotal(Integer quantidadeTotal) { this.quantidadeTotal = quantidadeTotal; }
    public Integer getQuantidadeVendida() { return quantidadeVendida; }
    public void setQuantidadeVendida(Integer quantidadeVendida) { this.quantidadeVendida = quantidadeVendida; }
    public LocalDateTime getValidoAte() { return validoAte; }
    public void setValidoAte(LocalDateTime validoAte) { this.validoAte = validoAte; }
    public LocalDateTime getEncerraVendasEm() { return encerraVendasEm; }
    public void setEncerraVendasEm(LocalDateTime encerraVendasEm) { this.encerraVendasEm = encerraVendasEm; }
}