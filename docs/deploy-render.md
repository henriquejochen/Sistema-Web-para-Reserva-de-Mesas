# Publicar no Render (grátis) com banco no Neon

Um único serviço no Render roda o Django, que entrega o site (`/`), a API (`/api`) e o painel (`/admin`) no mesmo endereço. O banco PostgreSQL fica no Neon.

Arquivos envolvidos: [Dockerfile](../Dockerfile), [render.yaml](../render.yaml), [backend/start.sh](../backend/start.sh) e as configurações em [backend/config/settings.py](../backend/config/settings.py). Nada disso muda o jeito de rodar no seu computador.

## 1. Banco no Neon

1. Crie uma conta em https://neon.tech e um projeto novo.
2. Região: **AWS US East 1 (N. Virginia)** — a mesma do serviço no Render.
3. No painel do projeto, clique em **Connect**, deixe **Connection pooling** ligado e copie a connection string. Ela tem este formato:
   `postgresql://usuario:senha@ep-xxxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`
4. Guarde essa string: ela é a `DATABASE_URL`. **Não** coloque no código nem no GitHub.

As tabelas são criadas sozinhas no primeiro deploy (`migrate`). As 16 mesas iniciais também (`criar_mesas`).

## 2. Código no GitHub

O Render publica a partir de um repositório do GitHub. Envie o projeto (com `Dockerfile`, `render.yaml`, `.dockerignore` e `.gitattributes`) para a branch que será publicada.
## 3. Serviço no Render

1. Crie uma conta em https://render.com e conecte o GitHub.
2. **New → Blueprint** e escolha o repositório. O Render lê o `render.yaml`.
3. Preencha as variáveis pedidas:
   | Variável | Valor |
   |---|---|
   | `DATABASE_URL` | a connection string do Neon |
   | `DJANGO_SUPERUSER_USERNAME` | usuário do administrador (ex.: `admin`) |
   | `DJANGO_SUPERUSER_PASSWORD` | uma senha forte |
   | `RESERVA_TELEFONE_CONTATO` | telefone da pizzaria (ex.: `+5548999999999`) ou deixe vazio |

   `DJANGO_SECRET_KEY` é gerada automaticamente e `DJANGO_DEBUG` já vem `False`.
4. Clique em **Apply**. O primeiro build leva alguns minutos.
5. Ao terminar, o endereço aparece no topo do serviço, ex.: `https://pizzaria-reservas.onrender.com`.

O domínio `*.onrender.com` é liberado automaticamente (`ALLOWED_HOSTS` e CSRF). Para um domínio próprio, adicione-o no Render e configure `DJANGO_ALLOWED_HOSTS=seudominio.com.br` e `DJANGO_CSRF_TRUSTED_ORIGINS=https://seudominio.com.br`.

## 4. Depois de publicar

- Site do cliente: `https://<seu-endereço>/`
- Área da equipe: `https://<seu-endereço>/equipe`
- Painel Django: `https://<seu-endereço>/admin` — entre com o administrador das variáveis e crie os funcionários (marque **Membro da equipe**).

O administrador só é criado se ainda não existir. Trocar `DJANGO_SUPERUSER_PASSWORD` depois **não** muda a senha; troque pelo `/admin`.

Cada `push` na branch configurada gera um novo deploy automaticamente.

## Limites do plano grátis

- O serviço desliga após ~15 min sem acesso; a primeira visita depois disso leva cerca de 1 minuto.
- O Neon também suspende sem uso e acorda na primeira consulta (alguns segundos a mais).
- Sem backup automático. Para guardar uma cópia: `pg_dump "<DATABASE_URL>" > backup.sql`.
- Os dados do `db.sqlite3` local não vão para a nuvem; o banco começa vazio (com as mesas).

## Se algo der errado

- **Build falhou:** veja **Logs** no Render. Erro em `start.sh` com `\r` significa que o arquivo foi salvo com fim de linha do Windows; o `.gitattributes` evita isso ao enviar pelo Git.
- **Erro 400 (Bad Request):** o domínio usado não está em `DJANGO_ALLOWED_HOSTS`.
- **Erro de CSRF ao reservar ou entrar:** o domínio não está em `DJANGO_CSRF_TRUSTED_ORIGINS` (só necessário para domínio próprio).
- **Erro de conexão com o banco:** confira a `DATABASE_URL` (precisa terminar com `?sslmode=require`).
