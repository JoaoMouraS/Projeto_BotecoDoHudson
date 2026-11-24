package com.botecodohudson.api.security;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limite simples de tentativas em memória (janela fixa). Protege login, cadastro e
 * links de convite contra força bruta e spam. Para várias instâncias da API,
 * trocar por Redis/bucket4j.
 */
@Component
public class RateLimiter {

    private record Janela(long inicio, int contagem) {
    }

    private final Map<String, Janela> janelas = new ConcurrentHashMap<>();

    /** Registra uma tentativa e devolve false se a chave estourou o limite na janela. */
    public boolean permitir(String chave, int limite, Duration janela) {
        long agora = System.currentTimeMillis();
        long duracao = janela.toMillis();
        limparSeNecessario(agora);
        Janela atual = janelas.compute(chave, (k, j) ->
                (j == null || agora - j.inicio() >= duracao) ? new Janela(agora, 1) : new Janela(j.inicio(), j.contagem() + 1));
        return atual.contagem() <= limite;
    }

    /** Só consulta (não conta tentativa): a chave já estourou o limite nesta janela? */
    public boolean bloqueado(String chave, int limite, Duration janela) {
        Janela j = janelas.get(chave);
        return j != null && System.currentTimeMillis() - j.inicio() < janela.toMillis() && j.contagem() >= limite;
    }

    public void zerar(String chave) {
        janelas.remove(chave);
    }

    /** Usado nos testes. */
    public void zerarTudo() {
        janelas.clear();
    }

    private void limparSeNecessario(long agora) {
        if (janelas.size() > 50_000) {
            // Janelas maiores que 1h nunca são usadas; tudo mais velho que isso pode sair.
            janelas.entrySet().removeIf(e -> agora - e.getValue().inicio() > Duration.ofHours(1).toMillis());
        }
    }
}
