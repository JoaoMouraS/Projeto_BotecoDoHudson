package com.botecodohudson.api.repository;

import com.botecodohudson.api.model.ProdutoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProdutoRepository extends JpaRepository<ProdutoModel, Long> {
    List<ProdutoModel> findByDisponivelTrueOrderByCategoriaAscNomeAsc();
}
