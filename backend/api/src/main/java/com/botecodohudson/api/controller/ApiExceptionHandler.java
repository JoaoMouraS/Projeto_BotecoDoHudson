package com.botecodohudson.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.util.Map;

/**
 * Respostas de erro padronizadas e sem detalhes internos (sem stacktrace,
 * sem mensagem de exceção, sem valores enviados).
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacao(MethodArgumentNotValidException ex) {
        var campos = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField())
                .distinct()
                .toList();
        return ResponseEntity.badRequest().body(Map.of(
                "erro", "Dados inválidos.",
                "campos", campos));
    }

    /** Erros de regra de negócio lançados pelos services (mensagens escritas por nós, seguras de mostrar). */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> regra(ResponseStatusException ex) {
        String mensagem = ex.getReason() != null ? ex.getReason() : "Não encontrado.";
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("erro", mensagem));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> arquivoGrande() {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(Map.of("erro", "Imagem muito grande (máximo 8 MB)."));
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<Map<String, Object>> semArquivo() {
        return ResponseEntity.badRequest().body(Map.of("erro", "Envie uma imagem."));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> corpoInvalido() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("erro", "Requisição mal formada."));
    }
}
