package com.botecodohudson.api.util;

import java.time.LocalDateTime;
import java.time.ZoneId;

/** Horário oficial do boteco, independente do fuso do servidor (que na nuvem costuma ser UTC). */
public final class Horario {

    public static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

    private Horario() {
    }

    public static LocalDateTime agora() {
        return LocalDateTime.now(FUSO);
    }
}
