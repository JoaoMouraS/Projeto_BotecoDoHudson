package com.botecodohudson.api.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

public final class Tokens {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ALFABETO = "abcdefghjkmnpqrstuvwxyz23456789";

    private Tokens() {
    }

    /** Token de 256 bits para links de e-mail. */
    public static String novoToken() {
        byte[] b = new byte[32];
        RANDOM.nextBytes(b);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }

    /** Código curto e legível (sem 0/o, 1/l/i). */
    public static String codigo(int tamanho) {
        StringBuilder sb = new StringBuilder(tamanho);
        for (int i = 0; i < tamanho; i++) sb.append(ALFABETO.charAt(RANDOM.nextInt(ALFABETO.length())));
        return sb.toString();
    }

    public static String sha256(String valor) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(valor.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
