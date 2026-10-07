package com.botecodohudson.api.controller;

import com.botecodohudson.api.model.EventoModel;
import com.botecodohudson.api.repository.EventoRepository;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "*")
public class EventoController {
    private final EventoRepository repository;

    public EventoController(EventoRepository repository) { this.repository = repository; }

    @GetMapping
    public List<EventoModel> listarPublicos() {
        return repository.findByPublicadoTrueAndDataEventoAfterOrderByDataEventoAsc(LocalDateTime.now());
    }

    @GetMapping("/datas-disponiveis")
    public List<LocalDateTime> datasDisponiveis() {
        return repository.findByPublicadoTrueAndDataEventoAfterOrderByDataEventoAsc(LocalDateTime.now())
                .stream().map(EventoModel::getDataEvento).toList();
    }

    @GetMapping("/admin")
    public List<EventoModel> listarTodos() { return repository.findAll(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventoModel criar(@Valid @RequestBody EventoModel evento) { return repository.save(evento); }

    @PutMapping("/{id}")
    public EventoModel atualizar(@PathVariable Long id, @Valid @RequestBody EventoModel dados) {
        EventoModel evento = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado."));
        evento.setNome(dados.getNome());
        evento.setDescricao(dados.getDescricao());
        evento.setDataEvento(dados.getDataEvento());
        evento.setLocal(dados.getLocal());
        evento.setPrecoIngresso(dados.getPrecoIngresso());
        evento.setImagemUrl(dados.getImagemUrl());
        evento.setSymplaUrl(dados.getSymplaUrl());
        evento.setImagensUrls(dados.getImagensUrls());
        evento.setPublicado(dados.isPublicado());
        return repository.save(evento);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) { repository.deleteById(id); }
}
