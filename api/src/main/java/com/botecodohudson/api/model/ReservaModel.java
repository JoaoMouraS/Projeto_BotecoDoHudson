package com.botecodohudson.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservas")
public class ReservaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReserva;

    @Column(nullable = false)
    private String nomeCliente;

    @Column(nullable = false)
    private Integer quantidadePessoas;

    @Column(nullable = false)
    private LocalDateTime dataReserva;

    @Column(nullable = false)
    private Boolean statusReserva = true;

    public ReservaModel() {
    }

    public ReservaModel(String nomeCliente, Integer quantidadePessoas, LocalDateTime dataReserva,
            Boolean statusReserva) {
        this.nomeCliente = nomeCliente;
        this.quantidadePessoas = quantidadePessoas;
        this.dataReserva = dataReserva;
        this.statusReserva = statusReserva;
    }

    public Long getIdReserva() {
        return idReserva;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public Integer getQuantidadePessoas() {
        return quantidadePessoas;
    }

    public void setQuantidadePessoas(Integer quantidadePessoas) {
        this.quantidadePessoas = quantidadePessoas;
    }

    public LocalDateTime getDataReserva() {
        return dataReserva;
    }

    public void setDataReserva(LocalDateTime dataReserva) {
        this.dataReserva = dataReserva;
    }

    public Boolean getStatusReserva() {
        return statusReserva;
    }

    public void setStatusReserva(Boolean statusReserva) {
        this.statusReserva = statusReserva;
    }
}
