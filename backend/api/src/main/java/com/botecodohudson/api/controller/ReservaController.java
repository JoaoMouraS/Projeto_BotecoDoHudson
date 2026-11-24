package com.botecodohudson.api.controller;

import com.botecodohudson.api.config.ReservaRegras;
import com.botecodohudson.api.dto.DisponibilidadeDTO;
import com.botecodohudson.api.dto.ReservaRequestDTO;
import com.botecodohudson.api.dto.ReservaResponseDTO;
import com.botecodohudson.api.model.UsuarioModel;
import com.botecodohudson.api.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;
    private final ReservaRegras regras;

    public ReservaController(ReservaService reservaService, ReservaRegras regras) {
        this.reservaService = reservaService;
        this.regras = regras;
    }

    /** Público: regras da casa (mínimos de pessoas, horário limite...) para montar a tela. */
    @GetMapping("/regras")
    public ReservaRegras regras() {
        return regras;
    }

    /** Público: o que dá para reservar num dia (evento ou casa exclusiva). */
    @GetMapping("/disponibilidade")
    public DisponibilidadeDTO disponibilidade(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return reservaService.disponibilidade(data);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaResponseDTO criar(@Valid @RequestBody ReservaRequestDTO dto,
                                    @AuthenticationPrincipal UsuarioModel usuario) {
        return reservaService.criarReserva(dto, usuario);
    }

    /** Somente ADMIN (regra em SecurityConfig): todas as reservas, para o dashboard. */
    @GetMapping
    public List<ReservaResponseDTO> listarTodas() {
        return reservaService.listarTodas();
    }

    @GetMapping("/minhas")
    public List<ReservaResponseDTO> minhas(@AuthenticationPrincipal UsuarioModel usuario) {
        return reservaService.listarDoUsuario(usuario);
    }

    @PatchMapping("/{id}/cancelar")
    public ReservaResponseDTO cancelar(@PathVariable Long id, @AuthenticationPrincipal UsuarioModel usuario) {
        return reservaService.cancelar(id, usuario);
    }

    /** Somente ADMIN: o grupo chegou. */
    @PatchMapping("/{id}/check-in")
    public ReservaResponseDTO checkIn(@PathVariable Long id, @AuthenticationPrincipal UsuarioModel usuario) {
        return reservaService.checkIn(id, usuario);
    }

    @PostMapping(value = "/{id}/capa", consumes = "multipart/form-data")
    public ReservaResponseDTO capa(@PathVariable Long id, @RequestParam("arquivo") MultipartFile arquivo,
                                   @AuthenticationPrincipal UsuarioModel usuario) {
        return reservaService.definirCapa(id, arquivo, usuario);
    }

    @DeleteMapping("/{id}/convidados/{convidadoId}")
    public ReservaResponseDTO removerConvidado(@PathVariable Long id, @PathVariable Long convidadoId,
                                               @AuthenticationPrincipal UsuarioModel usuario) {
        return reservaService.removerConvidado(id, convidadoId, usuario);
    }
}
