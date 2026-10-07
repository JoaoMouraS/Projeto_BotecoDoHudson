# Supabase no deploy

## Galeria

1. Crie um projeto no Supabase.
2. Em **Storage**, crie um bucket publico chamado `gallery`.
3. Execute `documentacao/supabase-gallery.sql` no SQL Editor.
4. Envie as imagens para o bucket e insira uma linha em `gallery_photos` para cada foto. O campo `storage_path` deve ser o caminho do arquivo dentro do bucket, por exemplo `2026/junho/festa-01.jpg`.
5. No frontend, configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` usando a chave publicável. Essa chave pode ficar no frontend. Nunca publique `sb_secret_...`, `service_role` ou qualquer outra chave secreta no frontend.

Se uma chave `sb_secret_...` foi enviada por chat, commit, issue ou terminal compartilhado, revogue-a em **Supabase > Project Settings > API > Secret keys** e gere outra. Chaves secretas não devem ser colocadas em `.env` do frontend, `VITE_*`, `localStorage` ou código JavaScript do navegador.

## Usuarios e login

O backend atual usa Spring Security e armazena o usuario, email e hash da senha na tabela `usuarios`. Para que esses dados sobrevivam ao deploy, configure o datasource do backend para o PostgreSQL do Supabase:

- `DB_URL`: URL JDBC do pooler/session pooler exibida em **Supabase > Connect**.
- `DB_USERNAME`: usuario informado pelo Supabase, normalmente `postgres.<project-ref>` no pooler.
- `DB_PASSWORD`: senha do banco do projeto.
- `JWT_SECRET`: segredo longo e exclusivo da aplicacao.

Se o backend precisar acessar a API administrativa do Supabase no futuro, configure a nova chave secreta apenas no ambiente do backend como `SUPABASE_SECRET_KEY`. Nunca use essa variável com prefixo `VITE_`.

O Spring criara/atualizara as tabelas conforme `spring.jpa.hibernate.ddl-auto=update`. Para producao, prefira migracoes versionadas e um backup antes de alterar o schema.

Este projeto ainda nao usa o Supabase Auth. Isso foi intencional: o login existente emite um JWT proprio que as rotas protegidas de reservas ja entendem. Migrar para Supabase Auth exige alterar a validacao de token no backend ou criar um endpoint de troca de tokens.
