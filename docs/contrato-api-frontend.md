# Contrato proposto para integrar o frontend

Implementação do frontend em `feat/reserva-sem-conta`, preparada em 08/11/2026. Este é um contrato proposto para aprovação e implementação pela equipe de backend; não descreve endpoints Django já existentes.

## Modos

- Sem `VITE_API_BASE_URL`: demonstração identificada, com dados fictícios no navegador. Não há disponibilidade nem autenticação reais.
- Com `VITE_API_BASE_URL=/api`: chamadas HTTP reais; falhas nunca fazem o sistema retornar à simulação. O cliente não aplica decisões de negócio no lugar do servidor.
- Variáveis Vite são públicas e aplicadas no início/build. Não colocar segredos nelas. Copiar `frontend/.env.example` para `frontend/.env.local` e reiniciar/recompilar após configurar.

Recomenda-se servir API e interface na mesma origem. O servidor web deve entregar `index.html` para as rotas de interface `/reservar`, `/reserva`, `/confirmacao`, `/equipe`, `/equipe/login`, `/equipe/reservas` e `/equipe/mesas`, preservando `/api` para o Django. Usar HTTPS em produção.

## Autenticação e erros

O cliente usa `credentials: include` e envia `X-CSRFToken` nas operações de escrita. `GET /staff/session/` deve funcionar para visitantes, emitir o cookie CSRF e retornar `authenticated: false` com HTTP 200 quando não houver sessão. Pode retornar `csrfToken` no JSON para configurações em que o cookie não seja legível pelo frontend. Login deve renovar a sessão e devolver o token CSRF atualizado. O servidor precisa validar CSRF, permissões e origem; o cliente não concede acesso.

Erros: HTTP 400 para dados inválidos, 401 para sessão expirada, 403 para operação não autorizada, 404 para registro/link inexistente e 409 para conflito de disponibilidade ou transição inválida. Preferir mensagens públicas que não exponham dados de terceiros.

```json
{
  "detail": "Confira os campos indicados.",
  "fields": { "phone": ["Informe um telefone com DDD válido."] }
}
```

Campos de reserva: `date`, `arrivalTime`, `guests`, `area`, `name`, `phone`, `note`. Campos de mesa: `number`, `capacity`, `area`, `active`, `status`. O frontend aceita mensagem única ou lista de mensagens em cada campo. Respostas incompatíveis ou não JSON são tratadas como erro.

## Endpoints (relativos à base)

| Método e caminho | Entrada | Saída de sucesso |
| --- | --- | --- |
| `GET /configuration/` | — | Configuração abaixo |
| `GET /staff/session/` | Cookie de sessão, se existir | `{ authenticated, csrfToken? }` |
| `POST /staff/login/` | `{ username, password }` | `{ authenticated: true, csrfToken? }` e cookie de sessão |
| `POST /staff/logout/` | — | 204; invalidar sessão no servidor |
| `GET /availability/?date=...&guests=...&area=...` | Dia, grupo e preferência | `{ available: boolean, message: string, alternatives: string[] }` |
| `POST /reservations/` | Visita + contato | 201 e reserva completa, já persistida e com mesa(s) atribuída(s) |
| `POST /reservations/access/` | `{ token }` | Reserva com ações públicas permitidas |
| `POST /reservations/cancel/` | `{ token }` | Reserva com estado atualizado |
| `GET /staff/reservations/?date=...` | Sessão da equipe e dia | Lista completa das reservas do dia |
| `POST /staff/reservations/action/` | Sessão e `{ token, action }` | Reserva atualizada |
| `GET /staff/tables/` | Sessão da equipe | Lista de mesas, incluindo inativas |
| `POST /staff/tables/` | Dados da mesa sem `id` | 201 e mesa criada |
| `PATCH /staff/tables/{id}/` | Dados da mesa | Mesa atualizada |

O frontend atual filtra status/chegada/busca, ordena por chegada e pagina em grupos de dez sobre a lista completa do dia. Não devolver uma página parcial silenciosamente. Se o volume exigir paginação no servidor, revisar o contrato e o carregamento do frontend em conjunto.

```json
{
  "minArrival": "19:30",
  "maxArrival": "21:30",
  "maxGuests": 12,
  "graceMinutes": 30,
  "warningMinutes": 15,
  "contactPhone": "+554800000000"
}
```

`contactPhone` deve ser o contato real aprovado pela pizzaria, ou `null`. O exemplo é fictício. Limites e políticas vêm do servidor; os valores do modo demonstração não são a fonte de produção.

## Reserva

```json
{
  "token": "<64 caracteres hexadecimais minúsculos, imprevisíveis>",
  "code": "R-IDENTIFICADOR",
  "date": "2026-12-20",
  "arrivalTime": "20:00",
  "guests": 2,
  "area": "any",
  "note": "",
  "name": "Cliente fictício",
  "phone": "48999990000",
  "status": "Confirmada",
  "tables": [3],
  "allowedActions": ["cancel"],
  "late": false,
  "delayMinutes": 0
}
```

`area`: `interna`, `externa` ou `any`. `status`: `Confirmada`, `Presente`, `Concluída` ou `Cancelada`. `tables` contém os números para exibição; a atribuição é responsabilidade do backend, que deve conferir capacidade e concorrência de forma transacional.

`allowedActions` é obrigatório. Na consulta pública, deve conter apenas ações públicas permitidas. Na lista administrativa, pode conter `arrive`, `complete`, `cancel` e `release`. O backend verifica a autorização novamente em toda operação. Nunca autorizar cancelamento apenas porque o cliente enviou um token com formato válido ou informou um status.

`late` e `delayMinutes` são calculados no servidor com o fuso da pizzaria. O painel atualiza a consulta a cada 30 segundos; não usa o relógio do aparelho para habilitar liberação por ausência. A ação `release` exige confirmação na interface e validação no servidor. O motivo pode ser retornado em `cancellationReason`.

O estado específico “Não compareceu” continua dependendo de aprovação da equipe. A interface mantém o status atual `Cancelada`, podendo mostrar `cancellationReason`; não introduz uma nova regra de negócio.

## Criação e resultado incerto

`POST /reservations/` envia `Idempotency-Key`, um UUID mantido nas tentativas do mesmo formulário sem alterações. O servidor precisa garantir que repetições dessa chave com a mesma entrada não criem outra reserva e devolver o resultado persistido. Rejeitar reutilização com payload diferente. Definir retenção suficiente para a operação e proteção contra abuso no backend.

O cliente tem timeout de 15 segundos e não repete escritas automaticamente. Em erro de rede preserva os dados e orienta consultar o resultado antes de repetir. Disponibilidade consultada não garante sucesso posterior; a criação pode devolver 409. A confirmação só aparece após resposta válida do servidor.

O token do link fica no fragmento `#reserva=...`, que o navegador não envia ao servidor ao abrir a página. O cliente o transmite no corpo da consulta/cancelamento. Evitar registrar tokens em logs e usar `Cache-Control: no-store` nas respostas pessoais. O código curto serve para identificação, sem conceder acesso.

## Mesa

```json
{ "id": 1, "number": 1, "capacity": 4, "area": "interna", "active": true, "status": "Disponível" }
```

`status`: `Disponível`, `Reservada` ou `Ocupada`. A relação entre situação operacional e reservas, os limites de capacidade e os impedimentos de inativação devem ser definidos e aplicados no backend. O frontend não apaga mesas nem histórico. Campos não autorizados devem ser rejeitados pelo servidor.

## Aprovações e validações ainda necessárias

- Aprovar contrato, atribuição de uma ou mais mesas e tratamento de ausência com a equipe.
- Implementar os endpoints e as regras no Django, incluindo proteção contra conflitos no banco.
- Definir contato real e texto de privacidade aprovado pelo estabelecimento.
- Repetir os testes contra o backend real, em dois dispositivos e em HTTPS.
- Validar teclado, data/hora e barras do navegador em Android e iPhone reais. Testes automatizados desktop com viewport móvel não substituem essa etapa.
