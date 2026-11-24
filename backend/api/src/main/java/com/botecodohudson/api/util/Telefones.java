package com.botecodohudson.api.util;

public final class Telefones {

    private Telefones() {
    }

    /** "(21) 99999-0000" → "21999990000". Devolve null se não tiver entre 10 e 13 dígitos. */
    public static String normalizar(String telefone) {
        if (telefone == null) return null;
        String digitos = telefone.replaceAll("\\D", "");
        return (digitos.length() >= 10 && digitos.length() <= 13) ? digitos : null;
    }

    public static String primeiroNome(String nome) {
        if (nome == null || nome.isBlank()) return "";
        return nome.trim().split("\\s+")[0];
    }
}
