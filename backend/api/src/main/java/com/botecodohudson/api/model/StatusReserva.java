package com.botecodohudson.api.model;

public enum StatusReserva {
    /** Criada; esperando os amigos retirarem o convite até bater a meta mínima. */
    AGUARDANDO_CONVIDADOS,
    /** Meta mínima atingida: mesa garantida na casa. */
    CONFIRMADA,
    CANCELADA,
    /** Dia de evento: o grupo não fez check-in até o horário limite (20h) e a mesa foi liberada. */
    EXPIRADA;

    public boolean ativa() {
        return this == AGUARDANDO_CONVIDADOS || this == CONFIRMADA;
    }
}
