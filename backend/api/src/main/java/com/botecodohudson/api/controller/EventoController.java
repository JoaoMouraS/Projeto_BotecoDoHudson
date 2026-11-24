package com.botecodohudson.api.controller;

import com.botecodohudson.api.evento.EventoDTO;
import com.botecodohudson.api.evento.EventoManualDTO;
import com.botecodohudson.api.evento.EventoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    /** Público: próximos eventos (Sympla + cadastrados à mão). */
    @GetMapping
    public List<EventoDTO> futuros() {
        return eventoService.futuros();
    }

    /** ADMIN: cadastra evento que não está no Sympla. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventoDTO criar(@Valid @RequestBody EventoManualDTO dto) {
        return eventoService.criarManual(dto);
    }

    /** ADMIN: tira o evento do site. */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelar(@PathVariable Long id) {
        eventoService.cancelar(id);
    }

    /** ADMIN: força a sincronização com o Sympla agora. */
    @PostMapping("/sincronizar")
    public List<EventoDTO> sincronizar() {
        eventoService.sincronizarSympla();
        return eventoService.futuros();
    }
}
