package com.botecodohudson.api;

import com.botecodohudson.api.email.Correio;
import com.botecodohudson.api.email.Email;
import com.botecodohudson.api.repository.ReservaRepository;
import com.botecodohudson.api.security.RateLimiter;
import com.botecodohudson.api.service.ReservaService;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.HttpCookie;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Testes ponta a ponta contra um PostgreSQL real embutido (mesmas migrações do Supabase).
 * HTTP de verdade com cookies e CSRF, como o navegador. E-mails caem numa "caixa" de teste.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiApplicationTests {

    private static final EmbeddedPostgres POSTGRES;
    private static final JsonMapper JSON = JsonMapper.builder().build();
    private static final String ADMIN_EMAIL = "admin@teste.local";
    private static final String ADMIN_SENHA = "senha-do-admin-de-teste";
    private static final ZoneId SP = ZoneId.of("America/Sao_Paulo");

    static final List<Email> CAIXA = new CopyOnWriteArrayList<>();

    static {
        try {
            POSTGRES = EmbeddedPostgres.start();
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    @TestConfiguration
    static class CaixaDeEmail {
        @Bean
        @Primary
        Correio correioDeTeste() {
            return CAIXA::add;
        }
    }

    @DynamicPropertySource
    static void propriedades(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", () -> POSTGRES.getJdbcUrl("postgres", "postgres"));
        r.add("spring.datasource.username", () -> "postgres");
        r.add("spring.datasource.password", () -> "postgres");
        r.add("api.security.token.secret", () -> "segredo-de-teste-com-mais-de-32-caracteres!!");
        r.add("app.admin.email", () -> ADMIN_EMAIL);
        r.add("app.admin.senha", () -> ADMIN_SENHA);
        r.add("app.url", () -> "https://boteco.teste");
    }

    @Value("${local.server.port}")
    int porta;

    @Autowired
    RateLimiter rateLimiter;
    @Autowired
    ReservaService reservaService;
    @Autowired
    ReservaRepository reservaRepository;
    @Autowired
    TransactionTemplate tx;

    @BeforeEach
    void limpar() {
        rateLimiter.zerarTudo();
    }

    // ================================================================ conta e login

    @Test
    void cadastroIgnoraRoleExigeVerificacaoDeEmailParaReservar() throws Exception {
        Navegador nav = new Navegador();
        String email = unico("malandro");
        var resp = nav.post("/api/usuarios/cadastrar",
                "{\"nome\":\"Malandro\",\"email\":\"" + email + "\",\"senha\":\"12345678\",\"role\":\"ADMIN\"}");
        assertThat(resp.statusCode()).isEqualTo(201);
        assertThat(resp.body()).doesNotContain("senha").doesNotContain("$2a$");
        assertThat(json(resp).get("role").asString()).isEqualTo("USER");
        assertThat(json(resp).get("emailVerificado").asBoolean()).isFalse();
        assertThat(nav.get("/api/reservas").statusCode()).isEqualTo(403);
        assertThat(resp.headers().allValues("set-cookie"))
                .anyMatch(c -> c.startsWith("boteco_sessao=") && c.contains("HttpOnly") && c.contains("SameSite=Strict"));

        // Não verificado → não reserva.
        long evento = criarEvento(LocalDate.now(SP).plusDays(5));
        var naoVerif = nav.post("/api/reservas", reservaEvento(evento, 8));
        assertThat(naoVerif.statusCode()).as(naoVerif.body()).isEqualTo(403);

        // Link do e-mail aponta para o endereço público (APP_URL), não localhost.
        Email boasVindas = esperarEmail(email, "Confirme");
        assertThat(boasVindas.linkPrincipal()).startsWith("https://boteco.teste/verificar-email?token=");
        String token = token(boasVindas);
        assertThat(nav.post("/api/auth/verificar-email", "{\"token\":\"" + token + "\"}").statusCode()).isEqualTo(200);
        assertThat(json(nav.get("/api/usuarios/me")).get("emailVerificado").asBoolean()).isTrue();
        // Link é de uso único.
        assertThat(nav.post("/api/auth/verificar-email", "{\"token\":\"" + token + "\"}").statusCode()).isEqualTo(400);

        assertThat(nav.post("/api/reservas", reservaEvento(evento, 8)).statusCode()).isEqualTo(201);
    }

    @Test
    void semTokenCsrfNaoPassa() throws Exception {
        Navegador nav = new Navegador();
        nav.get("/api/usuarios/me");
        var resp = nav.enviar("POST", "/api/login", "{\"email\":\"x@y.z\",\"senha\":\"12345678\"}", false);
        assertThat(resp.statusCode()).isEqualTo(403);
    }

    @Test
    void loginErradoTemMensagemGenericaEBloqueiaDepoisDeCincoTentativas() throws Exception {
        String email = unico("zeca");
        new Navegador().cadastrar("Zeca", email, "senha-certa-123");
        Navegador outro = new Navegador();

        var inexistente = outro.post("/api/login", "{\"email\":\"ninguem@teste.local\",\"senha\":\"qualquer1\"}");
        var senhaErrada = outro.post("/api/login", "{\"email\":\"" + email + "\",\"senha\":\"errada123\"}");
        assertThat(inexistente.statusCode()).isEqualTo(401);
        assertThat(senhaErrada.body()).isEqualTo(inexistente.body());

        for (int i = 0; i < 4; i++) outro.post("/api/login", "{\"email\":\"" + email + "\",\"senha\":\"errada123\"}");
        var bloqueado = outro.post("/api/login", "{\"email\":\"" + email + "\",\"senha\":\"senha-certa-123\"}");
        assertThat(bloqueado.statusCode()).isEqualTo(429);
    }

    @Test
    void trocaDeSenhaPeloPerfilEPorLinkNoEmailDerrubaOutrasSessoes() throws Exception {
        String email = unico("bia");
        Navegador celular = contaVerificada("Bia", email);
        Navegador computador = new Navegador();
        computador.post("/api/login", "{\"email\":\"" + email + "\",\"senha\":\"senha-forte-123\"}");
        assertThat(computador.get("/api/usuarios/me").statusCode()).isEqualTo(200);

        assertThat(celular.post("/api/usuarios/me/senha/link", null).statusCode()).isEqualTo(202);
        String token = token(esperarEmail(email, "trocar sua senha"));

        Navegador abriuOLink = new Navegador();
        var r = abriuOLink.post("/api/auth/redefinir-senha", "{\"token\":\"" + token + "\",\"novaSenha\":\"senha-nova-456\"}");
        assertThat(r.statusCode()).isEqualTo(200);
        assertThat(abriuOLink.get("/api/usuarios/me").statusCode()).isEqualTo(200);  // entrou logado
        assertThat(computador.get("/api/usuarios/me").statusCode()).isEqualTo(204);  // sessões antigas caíram
        assertThat(celular.get("/api/usuarios/me").statusCode()).isEqualTo(204);
        // Uso único
        assertThat(new Navegador().post("/api/auth/redefinir-senha",
                "{\"token\":\"" + token + "\",\"novaSenha\":\"outra-senha-789\"}").statusCode()).isEqualTo(400);
        assertThat(new Navegador().post("/api/login", "{\"email\":\"" + email + "\",\"senha\":\"senha-nova-456\"}")
                .statusCode()).isEqualTo(200);
    }

    @Test
    void esqueciASenhaNaoRevelaSeOEmailExiste() throws Exception {
        String existe = unico("dora");
        contaVerificada("Dora", existe);
        int antes = CAIXA.size();
        var a = new Navegador().post("/api/auth/esqueci-senha", "{\"email\":\"" + existe + "\"}");
        var b = new Navegador().post("/api/auth/esqueci-senha", "{\"email\":\"fantasma@teste.local\"}");
        assertThat(a.statusCode()).isEqualTo(202);
        assertThat(b.statusCode()).isEqualTo(202);
        assertThat(a.body()).isEqualTo(b.body());
        esperarEmail(existe, "trocar sua senha");
        assertThat(CAIXA.subList(antes, CAIXA.size())).noneMatch(e -> e.para().equals("fantasma@teste.local"));
    }

    @Test
    void perfilFotoEExclusaoDeConta() throws Exception {
        String email = unico("caio");
        Navegador nav = contaVerificada("Caio", email);

        var editado = nav.enviar("PUT", "/api/usuarios/me",
                "{\"nome\":\"Caio Lima\",\"telefone\":\"(31) 98888-1111\",\"dataNascimento\":\"1995-04-10\"}", true);
        assertThat(json(editado).get("telefone").asString()).isEqualTo("31988881111");

        // Foto: PNG entra, sai JPEG; arquivo que não é imagem é recusado.
        var foto = nav.upload("/api/usuarios/me/foto", "eu.png", "image/png", png(900, 600));
        assertThat(foto.statusCode()).isEqualTo(200);
        String fotoUrl = json(foto).get("fotoUrl").asString();
        var img = new Navegador().getBytes(fotoUrl);
        assertThat(img.statusCode()).isEqualTo(200);
        assertThat(img.headers().firstValue("content-type")).hasValue("image/jpeg");
        BufferedImage lida = ImageIO.read(new java.io.ByteArrayInputStream(img.body()));
        assertThat(Math.max(lida.getWidth(), lida.getHeight())).isLessThanOrEqualTo(512);
        assertThat(nav.upload("/api/usuarios/me/foto", "virus.png", "image/png",
                "<script>alert(1)</script>".getBytes(StandardCharsets.UTF_8)).statusCode()).isEqualTo(400);

        assertThat(nav.enviar("DELETE", "/api/usuarios/me", "{\"senha\":\"errada\"}", true).statusCode()).isEqualTo(403);
        assertThat(nav.enviar("DELETE", "/api/usuarios/me", "{\"senha\":\"senha-forte-123\"}", true).statusCode()).isEqualTo(204);
        assertThat(new Navegador().getBytes(fotoUrl).statusCode()).isEqualTo(404); // foto apagada junto
    }

    // ================================================================ reservas por evento + convites

    @Test
    void fluxoCompletoReservaDeEventoComConvitesConfirmadosPorEmail() throws Exception {
        long evento = criarEvento(LocalDate.now(SP).plusDays(6));
        String emailAna = unico("ana");
        Navegador ana = contaVerificada("Ana Souza", emailAna);
        ana.upload("/api/usuarios/me/foto", "ana.png", "image/png", png(300, 300));

        assertThat(ana.post("/api/reservas", reservaEvento(evento, 4)).statusCode()).isEqualTo(400); // < 8
        var criada = ana.post("/api/reservas", reservaEvento(evento, 9));
        assertThat(criada.statusCode()).isEqualTo(201);
        JsonNode reserva = json(criada);
        String codigo = reserva.get("codigoConvite").asString();
        long id = reserva.get("id").asLong();
        assertThat(reserva.get("status").asString()).isEqualTo("AGUARDANDO_CONVIDADOS");
        assertThat(reserva.get("metaMinima").asInt()).isEqualTo(8);
        assertThat(reserva.get("dataReserva").asString()).endsWith("T20:00:00"); // chegada até 20h
        assertThat(reserva.get("evento").get("nome").asString()).isEqualTo("Pagode do Hudson");
        assertThat(ana.post("/api/reservas", reservaEvento(evento, 9)).statusCode()).isEqualTo(400); // 1 por evento
        assertThat(esperarEmail(emailAna, "agora chama a roda").linkPrincipal()).isEqualTo("https://boteco.teste/c/" + codigo);

        // Link público: primeiro nome + foto do anfitrião, sem telefone/sobrenome.
        Navegador amigo = new Navegador();
        var resumo = amigo.get("/api/convites/" + codigo);
        assertThat(json(resumo).get("anfitriao").asString()).isEqualTo("Ana");
        assertThat(json(resumo).get("anfitriaoFotoUrl").asString()).startsWith("/api/imagens/");
        assertThat(resumo.body()).doesNotContain("21988887777").doesNotContain("Souza").doesNotContain(emailAna);

        // Amigo sem conta: fica PENDENTE até clicar no e-mail (não conta para a meta).
        var pendente = amigo.post("/api/convites/" + codigo, conviteJson("Bruno", "bruno@amigos.local"));
        assertThat(pendente.statusCode()).isEqualTo(202);
        assertThat(json(pendente).get("situacao").asString()).isEqualTo("PENDENTE");
        assertThat(json(pendente).get("convite").get("confirmados").asInt()).isEqualTo(1);
        String tokenBruno = token(esperarEmail("bruno@amigos.local", "te chamou"));
        var confirmado = amigo.post("/api/convites/confirmar", "{\"token\":\"" + tokenBruno + "\"}");
        assertThat(json(confirmado).get("situacao").asString()).isEqualTo("CONFIRMADO");
        String ingressoBruno = json(confirmado).get("codigoIngresso").asString();
        assertThat(json(confirmado).get("convite").get("confirmados").asInt()).isEqualTo(2);
        // Ingresso chega por e-mail e abre por link público (sem dados pessoais).
        assertThat(esperarEmail("bruno@amigos.local", "Seu ingresso").linkPrincipal()).endsWith("/ingresso/" + ingressoBruno);
        var ingresso = new Navegador().get("/api/ingressos/" + ingressoBruno);
        assertThat(json(ingresso).get("valido").asBoolean()).isTrue();
        assertThat(ingresso.body()).doesNotContain("bruno@amigos.local");
        // Clicar de novo no link não duplica.
        assertThat(json(amigo.post("/api/convites/confirmar", "{\"token\":\"" + tokenBruno + "\"}"))
                .get("convite").get("confirmados").asInt()).isEqualTo(2);
        // Mesmo e-mail de novo → recusado.
        assertThat(amigo.post("/api/convites/" + codigo, conviteJson("Bruno 2", "BRUNO@amigos.local")).statusCode()).isEqualTo(409);
        // Anfitrião não retira convite da própria reserva.
        assertThat(amigo.post("/api/convites/" + codigo, conviteJson("Ana", emailAna)).statusCode()).isEqualTo(409);

        // Amigo COM conta verificada: ingresso na hora e aparece no perfil.
        String emailCarla = unico("carla");
        Navegador carla = contaVerificada("Carla", emailCarla);
        var direto = carla.post("/api/convites/" + codigo, conviteJson("Carla", "qualquer@coisa.local"));
        assertThat(direto.statusCode()).isEqualTo(201);
        assertThat(json(direto).get("situacao").asString()).isEqualTo("CONFIRMADO");
        var meus = json(carla.get("/api/usuarios/me/ingressos"));
        assertThat(meus.size()).isEqualTo(1);
        assertThat(meus.get(0).get("eventoNome").asString()).isEqualTo("Pagode do Hudson");

        // Mais 5 confirmações → 8 = meta → CONFIRMADA e a Ana recebe "Mesa liberada".
        for (int i = 1; i <= 5; i++) {
            String e = "amigo" + i + "@amigos.local";
            amigo.post("/api/convites/" + codigo, conviteJson("Amigo" + i, e));
            amigo.post("/api/convites/confirmar", "{\"token\":\"" + token(esperarEmail(e, "te chamou")) + "\"}");
        }
        JsonNode minha = json(ana.get("/api/reservas/minhas")).get(0);
        assertThat(minha.get("confirmados").asInt()).isEqualTo(8);
        assertThat(minha.get("status").asString()).isEqualTo("CONFIRMADA");
        assertThat(minha.toString()).doesNotContain("amigos.local");
        esperarEmail(emailAna, "Mesa liberada");

        // Intruso não mexe na reserva; usuário comum não faz check-in.
        Navegador intruso = contaVerificada("Intruso", unico("intruso"));
        assertThat(intruso.enviar("PATCH", "/api/reservas/" + id + "/cancelar", null, true).statusCode()).isEqualTo(404);
        assertThat(ana.enviar("PATCH", "/api/reservas/" + id + "/check-in", null, true).statusCode()).isEqualTo(403);

        // Prévia do WhatsApp: tags og: com foto e redireciona para a página do convite.
        var previa = new Navegador().get("/c/" + codigo);
        assertThat(previa.statusCode()).isEqualTo(200);
        assertThat(previa.body()).contains("og:title").contains("Ana")
                .contains("og:image\" content=\"https://boteco.teste/api/imagens/").contains("url=/convite/" + codigo);

        // Admin vê todas e faz check-in.
        Navegador admin = loginAdmin();
        assertThat(admin.get("/api/reservas").body()).contains(codigo);
        assertThat(json(admin.enviar("PATCH", "/api/reservas/" + id + "/check-in", null, true)).get("checkIn").asBoolean()).isTrue();
    }

    @Test
    void semCheckInAte20hAMesaELiberada() throws Exception {
        long evento = criarEvento(LocalDate.now(SP).plusDays(3));
        Navegador a = contaVerificada("Duda", unico("duda"));
        Navegador b = contaVerificada("Edu", unico("edu"));
        long semCheckIn = json(a.post("/api/reservas", reservaEvento(evento, 8))).get("id").asLong();
        long comCheckIn = json(b.post("/api/reservas", reservaEvento(evento, 8))).get("id").asLong();
        loginAdmin().enviar("PATCH", "/api/reservas/" + comCheckIn + "/check-in", null, true);

        // Simula que o horário limite já passou.
        tx.executeWithoutResult(s -> reservaRepository.findAllById(List.of(semCheckIn, comCheckIn))
                .forEach(r -> r.setDataReserva(LocalDateTime.now(SP).minusMinutes(1))));
        reservaService.liberarMesasSemCheckIn();

        assertThat(json(a.get("/api/reservas/minhas")).get(0).get("status").asString()).isEqualTo("EXPIRADA");
        assertThat(json(b.get("/api/reservas/minhas")).get(0).get("status").asString()).isEqualTo("AGUARDANDO_CONVIDADOS");
    }

    @Test
    void diaSemEventoViraReservaExclusivaComMinimoDe60() throws Exception {
        LocalDate livre = LocalDate.now(SP).plusDays(40);
        LocalDate comEvento = LocalDate.now(SP).plusDays(41);
        criarEvento(comEvento);

        var dispLivre = json(new Navegador().get("/api/reservas/disponibilidade?data=" + livre));
        assertThat(dispLivre.get("exclusivaDisponivel").asBoolean()).isTrue();
        var dispEvento = json(new Navegador().get("/api/reservas/disponibilidade?data=" + comEvento));
        assertThat(dispEvento.get("evento").get("nome").asString()).isEqualTo("Pagode do Hudson");
        assertThat(dispEvento.get("exclusivaDisponivel").asBoolean()).isFalse();
        // Muito em cima da hora para fechar a casa.
        assertThat(json(new Navegador().get("/api/reservas/disponibilidade?data=" + LocalDate.now(SP).plusDays(2)))
                .get("exclusivaDisponivel").asBoolean()).isFalse();

        Navegador festa = contaVerificada("Fê", unico("fe"));
        assertThat(festa.post("/api/reservas", reservaExclusiva(livre, 30)).statusCode()).isEqualTo(400);
        assertThat(festa.post("/api/reservas", reservaExclusiva(comEvento, 80)).statusCode()).isEqualTo(409);
        var ok = festa.post("/api/reservas", reservaExclusiva(livre, 80));
        assertThat(ok.statusCode()).isEqualTo(201);
        assertThat(json(ok).get("metaMinima").asInt()).isEqualTo(60);
        assertThat(json(ok).get("exclusiva").asBoolean()).isTrue();

        // Capa do aniversário.
        long id = json(ok).get("id").asLong();
        var capa = festa.upload("/api/reservas/" + id + "/capa", "festa.jpg", "image/png", png(2400, 1600));
        assertThat(json(capa).get("capaUrl").asString()).startsWith("/api/imagens/");

        // Outro grupo no mesmo dia → recusado.
        Navegador outra = contaVerificada("Gil", unico("gil"));
        assertThat(outra.post("/api/reservas", reservaExclusiva(livre, 70)).statusCode()).isEqualTo(409);
        assertThat(json(new Navegador().get("/api/reservas/disponibilidade?data=" + livre))
                .get("exclusivaDisponivel").asBoolean()).isFalse();
    }

    @Test
    void previaEscapaHtmlDoNome() throws Exception {
        long evento = criarEvento(LocalDate.now(SP).plusDays(8));
        Navegador nav = contaVerificada("<script>alert(1)</script>", unico("xss"));
        String corpo = reservaEvento(evento, 8).replace("Ana Souza", "<script>alert(1)</script>");
        String codigo = json(nav.post("/api/reservas", corpo)).get("codigoConvite").asString();
        String html = new Navegador().get("/c/" + codigo).body();
        assertThat(html).doesNotContain("<script>").contains("&lt;script&gt;");
    }

    @Test
    void rotasPublicasInvalidasDao404() throws Exception {
        assertThat(new Navegador().get("/api/convites/naoexiste1234").statusCode()).isEqualTo(404);
        assertThat(new Navegador().get("/api/convites/'%20or%201=1").statusCode()).isEqualTo(404);
        assertThat(new Navegador().get("/api/ingressos/naoexistenaoexiste12").statusCode()).isEqualTo(404);
        assertThat(new Navegador().get("/api/imagens/" + UUID.randomUUID()).statusCode()).isEqualTo(404);
        assertThat(new Navegador().post("/api/convites/confirmar", "{\"token\":\"invalidoinvalidoinvalido\"}").statusCode()).isEqualTo(400);
    }

    // ================================================================ apoio

    private long criarEvento(LocalDate dia) throws Exception {
        var r = loginAdmin().post("/api/eventos",
                "{\"nome\":\"Pagode do Hudson\",\"dataInicio\":\"" + dia + "T21:00:00\",\"imagemUrl\":\"https://img.teste/p.jpg\"}");
        assertThat(r.statusCode()).as(r.body()).isEqualTo(201);
        return json(r).get("id").asLong();
    }

    private Navegador loginAdmin() throws Exception {
        Navegador admin = new Navegador();
        var r = admin.post("/api/login", "{\"email\":\"" + ADMIN_EMAIL + "\",\"senha\":\"" + ADMIN_SENHA + "\"}");
        assertThat(r.statusCode()).isEqualTo(200);
        return admin;
    }

    private Navegador contaVerificada(String nome, String email) throws Exception {
        Navegador nav = new Navegador();
        nav.cadastrar(nome, email, "senha-forte-123");
        String token = token(esperarEmail(email, "Confirme"));
        assertThat(nav.post("/api/auth/verificar-email", "{\"token\":\"" + token + "\"}").statusCode()).isEqualTo(200);
        return nav;
    }

    private static String reservaEvento(long eventoId, int pessoas) {
        return "{\"eventoId\":" + eventoId + ",\"nomeCliente\":\"Ana Souza\",\"telefone\":\"(21) 98888-7777\","
                + "\"quantidadePessoas\":" + pessoas + ",\"aniversario\":true}";
    }

    private static String reservaExclusiva(LocalDate data, int pessoas) {
        return "{\"exclusiva\":true,\"data\":\"" + data + "\",\"nomeCliente\":\"Fê\",\"telefone\":\"31977776666\","
                + "\"quantidadePessoas\":" + pessoas + ",\"aniversario\":true,\"mensagem\":\"Bora!\"}";
    }

    private static String conviteJson(String nome, String email) {
        return "{\"nome\":\"" + nome + "\",\"email\":\"" + email + "\"}";
    }

    private static String unico(String nome) {
        return nome + "-" + UUID.randomUUID().toString().substring(0, 8) + "@teste.local";
    }

    /** E-mails saem em segundo plano: espera até 5s pelo e-mail certo. */
    private static Email esperarEmail(String para, String trechoAssunto) throws InterruptedException {
        for (int i = 0; i < 100; i++) {
            for (Email e : CAIXA) {
                if (e.para().equalsIgnoreCase(para) && e.assunto().contains(trechoAssunto)) {
                    CAIXA.remove(e);
                    return e;
                }
            }
            Thread.sleep(50);
        }
        throw new AssertionError("E-mail \"" + trechoAssunto + "\" para " + para + " não chegou");
    }

    private static String token(Email e) {
        return e.linkPrincipal().substring(e.linkPrincipal().indexOf("token=") + 6);
    }

    private static byte[] png(int w, int h) throws IOException {
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        var g = img.createGraphics();
        g.setColor(java.awt.Color.ORANGE);
        g.fillRect(0, 0, w, h);
        g.dispose();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(img, "png", out);
        return out.toByteArray();
    }

    private static JsonNode json(HttpResponse<String> resp) {
        return JSON.readTree(resp.body());
    }

    /** Simula um navegador: guarda cookies e manda o header CSRF como o axios faz. */
    private class Navegador {
        private final CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        private final HttpClient http = HttpClient.newBuilder().cookieHandler(cookies).build();

        HttpResponse<String> get(String caminho) throws Exception {
            return http.send(HttpRequest.newBuilder(uri(caminho)).GET().build(), HttpResponse.BodyHandlers.ofString());
        }

        HttpResponse<byte[]> getBytes(String caminho) throws Exception {
            return http.send(HttpRequest.newBuilder(uri(caminho)).GET().build(), HttpResponse.BodyHandlers.ofByteArray());
        }

        HttpResponse<String> post(String caminho, String corpo) throws Exception {
            return enviar("POST", caminho, corpo, true);
        }

        HttpResponse<String> enviar(String metodo, String caminho, String corpo, boolean comCsrf) throws Exception {
            if (comCsrf && csrf() == null) get("/api/usuarios/me");
            var req = HttpRequest.newBuilder(uri(caminho))
                    .method(metodo, corpo == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(corpo))
                    .header("Content-Type", "application/json");
            if (comCsrf) req.header("X-XSRF-TOKEN", csrf());
            return http.send(req.build(), HttpResponse.BodyHandlers.ofString());
        }

        HttpResponse<String> upload(String caminho, String nomeArquivo, String tipo, byte[] conteudo) throws Exception {
            if (csrf() == null) get("/api/usuarios/me");
            String limite = "----teste" + UUID.randomUUID();
            ByteArrayOutputStream corpo = new ByteArrayOutputStream();
            corpo.write(("--" + limite + "\r\nContent-Disposition: form-data; name=\"arquivo\"; filename=\"" + nomeArquivo
                    + "\"\r\nContent-Type: " + tipo + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
            corpo.write(conteudo);
            corpo.write(("\r\n--" + limite + "--\r\n").getBytes(StandardCharsets.UTF_8));
            var req = HttpRequest.newBuilder(uri(caminho))
                    .POST(HttpRequest.BodyPublishers.ofByteArray(corpo.toByteArray()))
                    .header("Content-Type", "multipart/form-data; boundary=" + limite)
                    .header("X-XSRF-TOKEN", csrf());
            return http.send(req.build(), HttpResponse.BodyHandlers.ofString());
        }

        void cadastrar(String nome, String email, String senha) throws Exception {
            var r = post("/api/usuarios/cadastrar",
                    "{\"nome\":\"" + nome + "\",\"email\":\"" + email + "\",\"senha\":\"" + senha + "\"}");
            assertThat(r.statusCode()).as(r.body()).isEqualTo(201);
        }

        private String csrf() {
            return cookies.getCookieStore().getCookies().stream()
                    .filter(c -> c.getName().equals("XSRF-TOKEN")).map(HttpCookie::getValue).findFirst().orElse(null);
        }

        private URI uri(String caminho) {
            return URI.create("http://localhost:" + porta + caminho);
        }
    }
}
