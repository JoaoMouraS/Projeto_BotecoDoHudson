package com.botecodohudson.api.repository;

import com.botecodohudson.api.model.TokenEmailModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;

public interface TokenEmailRepository extends JpaRepository<TokenEmailModel, Long> {

    Optional<TokenEmailModel> findByHash(String hash);

    /** Ao gerar um link novo, os anteriores do mesmo tipo deixam de valer. */
    @Modifying
    @Query("update TokenEmailModel t set t.usadoEm = :agora where t.usuario.id = :usuarioId and t.tipo = :tipo and t.usadoEm is null")
    void invalidarAnteriores(@Param("usuarioId") Long usuarioId, @Param("tipo") TokenEmailModel.Tipo tipo,
                             @Param("agora") Instant agora);
}
