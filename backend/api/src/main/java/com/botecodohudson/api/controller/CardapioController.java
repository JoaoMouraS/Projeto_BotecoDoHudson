package com.botecodohudson.api.controller;

import com.botecodohudson.api.model.ProdutoModel;
import com.botecodohudson.api.repository.ProdutoRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cardapio")
@CrossOrigin(origins = "*")
public class CardapioController {
    private final ProdutoRepository repository;

    public CardapioController(ProdutoRepository repository) { this.repository = repository; }

    @GetMapping
    public List<ProdutoModel> listarPublicos() {
        return repository.findByDisponivelTrueOrderByCategoriaAscNomeAsc();
    }

    @GetMapping("/admin")
    public List<ProdutoModel> listarTodos() { return repository.findAll(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutoModel criar(@Valid @RequestBody ProdutoModel produto) {
        return repository.save(produto);
    }

    @PutMapping("/{id}")
    public ProdutoModel atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoModel dados) {
        ProdutoModel produto = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado."));
        produto.setNome(dados.getNome());
        produto.setDescricao(dados.getDescricao());
        produto.setPreco(dados.getPreco());
        produto.setCategoria(dados.getCategoria());
        produto.setImagemUrl(dados.getImagemUrl());
        produto.setDisponivel(dados.isDisponivel());
        return repository.save(produto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) { repository.deleteById(id); }
}
