package com.botecodohudson.api.controller;

import com.botecodohudson.api.model.EventoModel;
import com.botecodohudson.api.repository.EventoRepository;
import com.botecodohudson.api.service.SupabaseStorageService;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "*")
public class EventoController {
    private final EventoRepository repository;
    private final SupabaseStorageService storageService;

    public EventoController(EventoRepository repository, SupabaseStorageService storageService) {
        this.repository = repository;
        this.storageService = storageService;
    }

    @GetMapping
    public List<EventoModel> listarPublicos() {
        return repository.findByPublicadoTrueAndDataEventoAfterOrderByDataEventoAsc(LocalDateTime.now());
    }

    @GetMapping("/datas-disponiveis")
    public List<LocalDateTime> datasDisponiveis() {
        return repository.findByPublicadoTrueAndDataEventoAfterOrderByDataEventoAsc(LocalDateTime.now())
            .stream().map(evento -> evento.getDataEvento()).toList();
    }

    @GetMapping("/admin")
    public List<EventoModel> listarTodos() { return repository.findAll(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventoModel criar(@Valid @RequestBody EventoModel evento) { return repository.save(evento); }

    @PostMapping("/{id}/imagens")
    public EventoModel enviarImagens(@PathVariable Long id, @RequestParam("imagens") List<MultipartFile> imagens) {
        EventoModel evento = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado."));
        imagens.forEach(imagem -> evento.getImagensUrls().add(
                storageService.upload("event-images", "events/" + id, imagem)));
        if (evento.getImagemUrl() == null && !evento.getImagensUrls().isEmpty()) {
            evento.setImagemUrl(evento.getImagensUrls().get(0));
        }
        return repository.save(evento);
    }

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
