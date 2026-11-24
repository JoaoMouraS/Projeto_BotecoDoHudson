package com.botecodohudson.api.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "reservas")
public class ReservaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReserva;

    // Dono da reserva (usuário logado que criou). Nunca vem do corpo da requisição.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioModel usuario;

    @Column(nullable = false, length = 120)
    private String nomeCliente;

    @Column(nullable = false, length = 20)
    private String telefone;

    /** Tamanho da mesa (anfitrião + convidados). */
    @Column(nullable = false)
    private Integer quantidadePessoas;

    /** Quantas pessoas (anfitrião incluso) precisam confirmar para a reserva valer. */
    @Column(nullable = false)
    private Integer metaMinima;

    /** Dia de evento: horário limite de chegada (ex.: 20h). Reserva exclusiva: o dia da festa. */
    @Column(nullable = false)
    private LocalDateTime dataReserva;

    /** Evento do boteco para o qual a mesa foi reservada (null = reserva exclusiva ou antiga). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evento_id")
    private EventoModel evento;

    /** Dia sem evento: a casa fica só para o grupo (mínimo maior de pessoas). */
    @Column(nullable = false)
    private Boolean exclusiva = false;

    /** Foto de capa do link de aniversário. */
    private UUID capaId;

    @Column(length = 280)
    private String mensagem;

    /** Quando o grupo chegou (marcado pelo admin). Sem check-in até o limite → EXPIRADA. */
    private Instant checkInEm;

    @Column(nullable = false)
    private Boolean aniversario = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusReserva status = StatusReserva.AGUARDANDO_CONVIDADOS;

    @Column(nullable = false, unique = true, length = 16)
    private String codigoConvite;

    @OneToMany(mappedBy = "reserva", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<ConvidadoModel> convidados = new ArrayList<>();

    /** Anfitrião conta como confirmado; convidados só depois de confirmar o e-mail. */
    public int getConfirmados() {
        return 1 + (int) convidados.stream().filter(ConvidadoModel::isConfirmado).count();
    }

    public List<ConvidadoModel> getConvidadosConfirmados() {
        return convidados.stream().filter(ConvidadoModel::isConfirmado).toList();
    }

    public boolean isLotada() {
        return getConfirmados() >= quantidadePessoas;
    }

    public boolean isPassada() {
        return dataReserva.isBefore(com.botecodohudson.api.util.Horario.agora());
    }

    /** Recalcula o status a partir do número de confirmados (não mexe em canceladas/expiradas). */
    public void atualizarStatus() {
        if (!status.ativa()) return;
        status = getConfirmados() >= metaMinima ? StatusReserva.CONFIRMADA : StatusReserva.AGUARDANDO_CONVIDADOS;
    }
}
