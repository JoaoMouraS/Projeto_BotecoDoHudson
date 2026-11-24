package com.botecodohudson.api.dto;

import java.util.UUID;

public final class ImagemUrls {
    private ImagemUrls() {
    }

    public static String de(UUID id) {
        return id == null ? null : "/api/imagens/" + id;
    }
}
