# Backend Django — Sistema de Reserva de Mesas

API REST com Django e Django REST Framework, seguindo o contrato do frontend em [docs/contrato-api-frontend.md](../docs/contrato-api-frontend.md). Os nomes dos campos da API são os do contrato (`date`, `guests`, `arrivalTime`…); no banco e no código Python continuam em português (`data`, `pessoas`, `previsao_chegada`…), traduzidos nos serializers.

## Iniciar no Windows (PowerShell)

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py criar_mesas
python manage.py createsuperuser
python manage.py runserver
```

No Linux/macOS: `python3 -m venv .venv`, `source .venv/bin/activate` e `cp .env.example .env`.

A migração inicial já está versionada em `reservas/migrations/`; **não** é preciso rodar `makemigrations`. Se você tinha um `db.sqlite3` ou migrações locais da versão anterior, apague-os antes do `migrate`.

Banco padrão: SQLite (desenvolvimento). Para PostgreSQL, configure as variáveis `POSTGRES_*` no `.env`. O modelo também está documentado em [database/schema.sql](../database/schema.sql) e as mesas iniciais em [database/seed.sql](../database/seed.sql).

## Ligar o frontend ao backend

Com o Django rodando em `localhost:8000`, crie `frontend/.env.local`:

```text
VITE_API_BASE_URL=http://localhost:8000/api
```

e rode `npm run dev` no frontend. Acesse a equipe por `/equipe` com um usuário **is_staff** (o superusuário serve; para funcionários, crie usuários no `/admin/` marcando "Membro da equipe").

Em produção o Django entrega o frontend compilado e a API no mesmo endereço. Passo a passo para publicar grátis no Render com banco no Neon: [docs/deploy-render.md](../docs/deploy-render.md).

## Endpoints

Todas as rotas começam com `/api`. Escritas exigem o cabeçalho `X-CSRFToken` (emitido em `GET /staff/session/`).

| Método | Rota | Acesso |
|---|---|---|
| GET | `/saude/` | público |
| GET | `/configuration/` | público |
| GET | `/availability/?date=2026-12-10&guests=3&area=any` | público |
| POST | `/reservations/` (cabeçalho `Idempotency-Key`) | público |
| POST | `/reservations/access/` `{"token": "..."}` | link secreto |
| POST | `/reservations/cancel/` `{"token": "..."}` | link secreto |
| GET | `/staff/session/` | público (diz se há sessão da equipe) |
| POST | `/staff/login/` `{"username","password"}` | público |
| POST | `/staff/logout/` | sessão |
| GET | `/staff/reservations/?date=2026-12-10` | equipe |
| POST | `/staff/reservations/action/` `{"token","action"}` | equipe |
| GET | `/staff/summary/?date=2026-12-10` | equipe |
| GET, POST | `/staff/tables/` | equipe |
| PATCH | `/staff/tables/<id>/` | equipe |

Ações da equipe: `arrive` (chegou), `complete` (concluir), `cancel` e `release` (não compareceu, só após a tolerância). Cada reserva traz `allowedActions` com o que é permitido no momento; o servidor confere de novo em toda operação.

Erros: `{"detail": "...", "fields": {"campo": ["..."]}}` — 400 dados inválidos, 401 sem sessão, 403 sem permissão/CSRF, 404 link inexistente, 409 conflito de disponibilidade ou ação não permitida, 429 excesso de requisições.

## Regras implementadas

- Disponibilidade por **dia inteiro** (RN15). O cliente escolhe só a área; o backend atribui a menor mesa ativa que comporte o grupo. Se nenhuma comportar, junta mesas livres da mesma área (ex.: 7 pessoas → duas mesas de 4).
- Uma mesa só tem uma reserva ativa por dia, garantido por restrição única condicional no banco (`ReservaMesa`), inclusive com pedidos simultâneos (RN01, RNF12).
- Reserva sem disponibilidade → 409 e sugestões de outra área/datas (RN14).
- Chegada dentro do horário configurado, até `RESERVA_MAX_PESSOAS`, telefone com DDD, data e chegada futuras.
- `Idempotency-Key`: reenviar o mesmo formulário não cria reserva duplicada; a mesma chave com outros dados é recusada.
- Token de 64 caracteres hexadecimais enviado no corpo (não na URL); código curto `R-XXXXXXXX` só identifica.
- Cliente cancela só reserva confirmada com chegada futura; cancelada/concluída/ausente libera a mesa.
- Atraso calculado no servidor; alerta após `RESERVA_ALERTA_MINUTOS`, liberação por ausência após `RESERVA_TOLERANCIA_MINUTOS` (RN23), nunca automática. Fica gravada como `nao_compareceu` e aparece para o frontend como `Cancelada` com motivo.
- Mesa com reservas ativas a partir de hoje não pode ser inativada; campos desconhecidos são rejeitados.
- Login da equipe por sessão + CSRF; só usuários `is_staff`. Limite de requisições por IP, `Cache-Control: no-store` na API e cookies seguros quando `DJANGO_DEBUG=False`.

**Pendente de decisão da equipe:** aprovar a junção de mesas para grupos grandes, o telefone de contato real e o texto de privacidade. A situação da mesa (Disponível/Reservada/Ocupada) é editada pela equipe; não é calculada a partir das reservas.

## Testes

```bash
python manage.py test reservas
```
