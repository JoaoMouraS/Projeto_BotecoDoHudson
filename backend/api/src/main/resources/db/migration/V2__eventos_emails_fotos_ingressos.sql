-- V2: eventos (Sympla/manual), verificação de e-mail, troca de senha por link,
-- fotos (perfil e capa de aniversário), ingressos dos convidados e check-in.

-- ---------------------------------------------------------------- imagens
-- Fotos ficam no próprio Postgres, já re-codificadas em JPEG pelo backend
-- (sem metadados/GPS). O id é um UUID aleatório: não dá para "chutar" fotos alheias.
CREATE TABLE imagens (
    id        UUID PRIMARY KEY,
    dono_id   BIGINT       NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    conteudo  BYTEA        NOT NULL,
    tipo      VARCHAR(40)  NOT NULL,
    criado_em TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_imagens_dono ON imagens (dono_id);

-- ---------------------------------------------------------------- usuários
ALTER TABLE usuarios
    ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN foto_id          UUID REFERENCES imagens (id) ON DELETE SET NULL;

-- Admin criado pelo seeder já é considerado verificado.
UPDATE usuarios SET email_verificado = TRUE WHERE role = 'ADMIN';

-- Links enviados por e-mail (verificar e-mail / redefinir senha).
-- Guardamos só o HASH do token: quem ler o banco não consegue usar o link.
CREATE TABLE tokens_email (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id  BIGINT       NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    tipo        VARCHAR(30)  NOT NULL CHECK (tipo IN ('VERIFICAR_EMAIL', 'REDEFINIR_SENHA')),
    hash        VARCHAR(64)  NOT NULL UNIQUE,
    expira_em   TIMESTAMPTZ  NOT NULL,
    usado_em    TIMESTAMPTZ,
    criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_tokens_usuario ON tokens_email (usuario_id, tipo);

-- ---------------------------------------------------------------- eventos
CREATE TABLE eventos (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fonte         VARCHAR(10)  NOT NULL CHECK (fonte IN ('SYMPLA', 'MANUAL')),
    id_externo    VARCHAR(60)  UNIQUE, -- id do evento no Sympla
    nome          VARCHAR(200) NOT NULL,
    descricao     TEXT,
    data_inicio   TIMESTAMP    NOT NULL, -- horário de Brasília
    imagem_url    VARCHAR(500),
    url           VARCHAR(500),          -- página de ingressos (Sympla)
    cancelado     BOOLEAN      NOT NULL DEFAULT FALSE,
    atualizado_em TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_eventos_data ON eventos (data_inicio);

-- ---------------------------------------------------------------- reservas
ALTER TABLE reservas
    ADD COLUMN evento_id    BIGINT REFERENCES eventos (id) ON DELETE SET NULL,
    ADD COLUMN exclusiva    BOOLEAN NOT NULL DEFAULT FALSE, -- dia sem evento, casa só para o grupo
    ADD COLUMN capa_id      UUID REFERENCES imagens (id) ON DELETE SET NULL,
    ADD COLUMN mensagem     VARCHAR(280),
    ADD COLUMN check_in_em  TIMESTAMPTZ;

ALTER TABLE reservas DROP CONSTRAINT reservas_status_check;
ALTER TABLE reservas ADD CONSTRAINT reservas_status_check
    CHECK (status IN ('AGUARDANDO_CONVIDADOS', 'CONFIRMADA', 'CANCELADA', 'EXPIRADA'));

ALTER TABLE reservas DROP CONSTRAINT reservas_quantidade_pessoas_check;
ALTER TABLE reservas ADD CONSTRAINT reservas_quantidade_pessoas_check
    CHECK (quantidade_pessoas BETWEEN 1 AND 1000);

CREATE INDEX idx_reservas_evento ON reservas (evento_id);

-- Só UMA reserva exclusiva ativa por dia (a casa inteira).
CREATE UNIQUE INDEX uq_reserva_exclusiva_por_dia ON reservas ((data_reserva::date))
    WHERE exclusiva AND status IN ('AGUARDANDO_CONVIDADOS', 'CONFIRMADA');

-- ---------------------------------------------------------------- convidados / ingressos
ALTER TABLE convidados
    ALTER COLUMN telefone DROP NOT NULL,
    ADD COLUMN email                 VARCHAR(255),
    ADD COLUMN usuario_id            BIGINT REFERENCES usuarios (id) ON DELETE SET NULL,
    ADD COLUMN confirmado_em         TIMESTAMPTZ, -- só conta para a meta depois de confirmar o e-mail
    ADD COLUMN confirmacao_hash      VARCHAR(64) UNIQUE,
    ADD COLUMN confirmacao_expira_em TIMESTAMPTZ,
    ADD COLUMN codigo_ingresso       VARCHAR(32);

-- Convidados que já existiam valem como confirmados e ganham um código de ingresso.
UPDATE convidados
   SET confirmado_em   = criado_em,
       codigo_ingresso = substr(md5(random()::text || id::text || clock_timestamp()::text), 1, 24);

ALTER TABLE convidados ALTER COLUMN codigo_ingresso SET NOT NULL;
ALTER TABLE convidados ADD CONSTRAINT uq_convidados_codigo_ingresso UNIQUE (codigo_ingresso);
CREATE UNIQUE INDEX uq_convidados_reserva_email ON convidados (reserva_id, lower(email)) WHERE email IS NOT NULL;
CREATE INDEX idx_convidados_email ON convidados (lower(email));
CREATE INDEX idx_convidados_usuario ON convidados (usuario_id);

-- ---------------------------------------------------------------- segurança (igual à V1)
ALTER TABLE imagens      ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos      ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    r TEXT;
BEGIN
    FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
            EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA boteco FROM %I', r);
            EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA boteco FROM %I', r);
        END IF;
    END LOOP;
END $$;
