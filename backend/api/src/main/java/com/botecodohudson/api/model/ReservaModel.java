package com.botecodohudson.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "reservas")
public class ReservaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReserva;

    @NotBlank(message = "Informe o nome do responsável.")
    @Column(nullable = false)
    private String nomeCliente;

    @NotNull(message = "Informe a quantidade de pessoas.")
    @Min(value = 2, message = "A reserva deve ter no mínimo 2 pessoas.")
    @Column(nullable = false)
    private Integer quantidadePessoas;

    @NotNull(message = "Informe a data e o horário da reserva.")
    @Future(message = "A reserva deve ser feita para uma data futura.")
    @Column(nullable = false)
    private LocalDateTime dataReserva;

    @Column(nullable = false)
    private Boolean statusReserva = true;

    @Column(nullable = false)
    private String status = "PENDENTE";

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
