-- Estrutura inicial do Boteco do Hudson.
-- Roda no schema "boteco" (configurado em application.properties), que NÃO é
-- exposto pela API REST/GraphQL automática do Supabase.

CREATE TABLE usuarios (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome            VARCHAR(120) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    senha           VARCHAR(100) NOT NULL, -- hash BCrypt, nunca a senha pura
    telefone        VARCHAR(20),           -- só dígitos
    data_nascimento DATE,
    role            VARCHAR(20)  NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    -- Incrementado ao trocar a senha/sair de todos os dispositivos: invalida sessões antigas.
    token_versao    INTEGER      NOT NULL DEFAULT 0,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE reservas (
    id_reserva          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id          BIGINT       NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    nome_cliente        VARCHAR(120) NOT NULL,
    telefone            VARCHAR(20)  NOT NULL,
    quantidade_pessoas  INTEGER      NOT NULL CHECK (quantidade_pessoas BETWEEN 1 AND 100),
    meta_minima         INTEGER      NOT NULL CHECK (meta_minima >= 1),
    data_reserva        TIMESTAMP    NOT NULL,
    aniversario         BOOLEAN      NOT NULL DEFAULT FALSE,
    status              VARCHAR(30)  NOT NULL DEFAULT 'AGUARDANDO_CONVIDADOS'
                        CHECK (status IN ('AGUARDANDO_CONVIDADOS', 'CONFIRMADA', 'CANCELADA')),
    -- Código aleatório do link de convite (/convite/{codigo}).
    codigo_convite      VARCHAR(16)  NOT NULL UNIQUE,
    criado_em           TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_reservas_usuario ON reservas (usuario_id);
CREATE INDEX idx_reservas_data ON reservas (data_reserva);

-- Amigos que retiraram o convite pelo link do anfitrião.
CREATE TABLE convidados (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reserva_id  BIGINT      NOT NULL REFERENCES reservas (id_reserva) ON DELETE CASCADE,
    nome        VARCHAR(80) NOT NULL,
    telefone    VARCHAR(20) NOT NULL, -- só dígitos; evita a mesma pessoa contar duas vezes
    criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (reserva_id, telefone)
);

-- Defesa em profundidade: mesmo que alguém exponha este schema na API do
-- Supabase por engano, o RLS ligado SEM nenhuma policy bloqueia todo acesso
-- das roles públicas. O backend conecta como dono das tabelas e não é afetado.
ALTER TABLE usuarios   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas   ENABLE ROW LEVEL SECURITY;
ALTER TABLE convidados ENABLE ROW LEVEL SECURITY;

-- No Supabase existem as roles "anon" e "authenticated" (usadas pela chave
-- publishable). Num Postgres comum elas não existem, então só revoga se existir.
DO $$
DECLARE
    r TEXT;
BEGIN
    FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
            EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA boteco FROM %I', r);
            EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA boteco FROM %I', r);
            EXECUTE format('REVOKE USAGE ON SCHEMA boteco FROM %I', r);
            EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA boteco REVOKE ALL ON TABLES FROM %I', r);
        END IF;
    END LOOP;
END $$;
