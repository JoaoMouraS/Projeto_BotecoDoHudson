package com.botecodohudson.api.util;

import com.botecodohudson.api.model.ReservaModel;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class Datas {

    private static final DateTimeFormatter DIA = DateTimeFormatter.ofPattern("EEEE, dd 'de' MMMM", Locale.of("pt", "BR"));
    private static final DateTimeFormatter HORA = DateTimeFormatter.ofPattern("HH'h'mm", Locale.of("pt", "BR"));

    private Datas() {
    }

    /** "sexta-feira, 27 de novembro · chegada até 20h00" / "... · casa exclusiva para o grupo" */
    public static String descrever(ReservaModel r) {
        String dia = DIA.format(r.getDataReserva());
        if (Boolean.TRUE.equals(r.getExclusiva())) return dia + " · casa exclusiva para o grupo";
        return dia + " · chegada até " + HORA.format(r.getDataReserva());
    }
}
