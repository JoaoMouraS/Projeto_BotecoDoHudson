package com.botecodohudson.api.service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SupabaseStorageService {
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp");

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.secret-key:}")
    private String secretKey;

    public String upload(String bucket, String folder, MultipartFile file) {
        validate(file);
        if (supabaseUrl.isBlank() || secretKey.isBlank()) {
            throw new IllegalStateException("Supabase Storage não está configurado no backend.");
        }

        String extension = extension(file.getOriginalFilename(), file.getContentType());
        String path = folder + "/" + UUID.randomUUID() + extension;
        String endpoint = supabaseUrl.replaceAll("/$", "") + "/storage/v1/object/"
                + encode(bucket) + "/" + encodePath(path);

        HttpRequest request;
        try {
            request = HttpRequest.newBuilder(URI.create(endpoint))
                    .header("Authorization", "Bearer " + secretKey)
                    .header("apikey", secretKey)
                    .header("Content-Type", file.getContentType())
                    .header("x-upsert", "false")
                    .PUT(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Falha no Supabase Storage: " + response.body());
            }
        } catch (IOException | InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Não foi possível enviar a imagem ao Supabase Storage.", exception);
        }

        return supabaseUrl.replaceAll("/$", "") + "/storage/v1/object/public/"
                + encode(bucket) + "/" + encodePath(path);
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Envie uma imagem.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("A imagem deve ter no máximo 10 MB.");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Formato inválido. Use JPG, PNG ou WEBP.");
        }
    }

    private String extension(String filename, String contentType) {
        String safeName = filename == null ? "" : filename.toLowerCase();
        if (safeName.endsWith(".png") || "image/png".equals(contentType)) return ".png";
        if (safeName.endsWith(".webp") || "image/webp".equals(contentType)) return ".webp";
        return ".jpg";
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private String encodePath(String value) {
        return String.join("/", value.split("/", -1));
    }
}
