package com.botecodohudson.api.controller;

import com.botecodohudson.api.dto.ConviteRequestDTO;
import com.botecodohudson.api.dto.ConviteResumoDTO;
import com.botecodohudson.api.dto.IngressoDTO;
import com.botecodohudson.api.dto.RetiradaConviteDTO;
import com.botecodohudson.api.dto.TokenDTO;
import com.botecodohudson.api.model.UsuarioModel;
import com.botecodohudson.api.service.ConviteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Rotas públicas do link de convite e dos ingressos (amigos não precisam ter conta). */
@RestController
@RequestMapping("/api")
public class ConviteController {

    private final ConviteService conviteService;

    public ConviteController(ConviteService conviteService) {
        this.conviteService = conviteService;
    }

    @GetMapping("/convites/{codigo}")
    public ConviteResumoDTO ver(@PathVariable String codigo) {
        return conviteService.resumo(codigo);
    }

    /** 201 = ingresso emitido (estava logado e verificado); 202 = confira o e-mail para confirmar. */
    @PostMapping("/convites/{codigo}")
    public ResponseEntity<RetiradaConviteDTO> retirar(@PathVariable String codigo,
                                                      @Valid @RequestBody ConviteRequestDTO dto,
                                                      @AuthenticationPrincipal UsuarioModel usuario) {
        RetiradaConviteDTO r = conviteService.retirar(codigo, dto, usuario);
        return ResponseEntity.status("CONFIRMADO".equals(r.situacao()) ? HttpStatus.CREATED : HttpStatus.ACCEPTED).body(r);
    }

    @PostMapping("/convites/confirmar")
    public RetiradaConviteDTO confirmar(@Valid @RequestBody TokenDTO dto) {
        return conviteService.confirmarPorToken(dto.token());
    }

    @GetMapping("/ingressos/{codigo}")
    public IngressoDTO ingresso(@PathVariable String codigo) {
        return conviteService.ingresso(codigo);
    }
}
