package com.botecodohudson.api.controller;

import com.botecodohudson.api.model.EventoModel;
import com.botecodohudson.api.model.IngressoModel;
import com.botecodohudson.api.repository.EventoRepository;
import com.botecodohudson.api.repository.IngressoRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/eventos/{eventoId}/ingressos")
public class IngressoController {
    private final EventoRepository eventoRepository;
    private final IngressoRepository ingressoRepository;

    public IngressoController(EventoRepository eventoRepository, IngressoRepository ingressoRepository) {
        this.eventoRepository = eventoRepository;
        this.ingressoRepository = ingressoRepository;
    }

    @GetMapping
    public List<IngressoModel> listar(@PathVariable Long eventoId) {
        return ingressoRepository.findByEvento(evento(eventoId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public IngressoModel criar(@PathVariable Long eventoId, @Valid @RequestBody IngressoModel dados) {
        IngressoModel ingresso = new IngressoModel();
        ingresso.setEvento(evento(eventoId));
        ingresso.setNome(dados.getNome());
        ingresso.setPublicoAlvo(dados.getPublicoAlvo());
        ingresso.setPreco(dados.getPreco());
        ingresso.setQuantidadeTotal(dados.getQuantidadeTotal());
        return ingressoRepository.save(ingresso);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long eventoId, @PathVariable Long id) {
        ingressoRepository.deleteById(id);
    }

    private EventoModel evento(Long id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Evento não encontrado."));
    }
}