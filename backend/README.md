# Backend Django — Sistema de Reserva de Mesas

API REST com Django e Django REST Framework. O frontend original **não foi modificado** e continua com dados de demonstração até integrar as chamadas HTTP.

## Iniciar no Windows (PowerShell)

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py makemigrations reservas
python manage.py migrate
python manage.py criar_mesas
python manage.py createsuperuser
python manage.py runserver
```

No Linux/macOS: `python3 -m venv .venv`, `source .venv/bin/activate` e `cp .env.example .env`.

Banco padrão: SQLite (desenvolvimento). Para PostgreSQL, configure as variáveis `POSTGRES_*` no `.env`. Para implantação real, configure `DJANGO_DEBUG=False`, chave secreta forte, HTTPS, hosts permitidos e servidor de produção.

## Endpoints

| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/saude/` | público |
| GET | `/api/mesas/disponiveis/?data=2026-12-10&pessoas=3&area=interna` | público |
| POST | `/api/reservas/` | público |
| GET | `/api/reservas/acesso/<token>/` | link secreto |
| POST | `/api/reservas/acesso/<token>/` | link secreto, JSON `{"confirmar":true}` |
| GET, POST | `/api/admin/mesas/` | administrador |
| GET, PATCH, PUT | `/api/admin/mesas/<id>/` | administrador |
| GET | `/api/admin/reservas/?data=2026-12-10&status=confirmada` | administrador |
| PATCH | `/api/admin/reservas/<id>/status/` | administrador |
| POST | `/api/admin/reservas/<id>/chegada/` | administrador |
| GET | `/api/admin/resumo/?data=2026-12-10` | administrador |

### Criar reserva

```json
{"mesa":1,"nome":"Maria","telefone":"48999998888","pessoas":3,"data":"2026-12-10","previsao_chegada":"19:00"}
```

A resposta inclui `codigo` e `token` secreto. Guarde o token no cliente para consultar/cancelar, **não publique o token em logs ou URLs compartilhadas**. A rota `/reservas/<token>` retornada é uma sugestão para o frontend implementar, não uma página já existente.

### Autenticação administrativa

Use o painel `/admin/` com o superusuário criado. As rotas `/api/admin/` exigem usuário `is_staff`. Para integração por frontend em outra origem, é necessário implementar fluxo de login e proteção CSRF (ou outra autenticação adequada) antes de colocar em produção. A API não oferece cadastro/login de clientes, conforme RF03.

## Regras implementadas

- Mesas ativas e com capacidade suficiente; disponibilidade por **dia inteiro**, não por horário (RN01, RN03, RN04, RN15).
- Uma reserva confirmada por mesa/dia, protegida por restrição única condicional no banco (recomendado PostgreSQL em produção).
- Dados obrigatórios e telefone com DDD, data/previsão futuras.
- Código único e token aleatório de acesso; cliente só consulta/cancela com token.
- Cancelamento confirmado apenas para reserva futura; cancelada libera mesa.
- Gestão de mesas, status, chegada e resumo, restritos a administradores.

**Observações:** a regra de atraso/tolerância e horários de funcionamento ainda dependem de definições de negócio; não foram inventadas. O protótipo React usa `localStorage` e ainda precisa ser conectado à API. Para produção, adicionar limites de requisição (rate limiting), logs seguros, HTTPS, testes de concorrência em PostgreSQL e autenticação de funcionários via sessão/CSRF ou token apropriado.

## Testes

```bash
python manage.py test reservas
```
