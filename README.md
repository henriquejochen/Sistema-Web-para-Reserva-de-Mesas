# Pizzaria Reservas

Aplicação web para consulta de disponibilidade e reserva de mesas em uma pizzaria.

## Objetivo

Facilitar o agendamento de mesas pelos clientes e oferecer aos funcionários uma visão organizada das reservas da pizzaria.

## Situação do projeto

O projeto está na fase de prototipação (Entrega 01). Nesta etapa serão definidos o escopo, as telas, o fluxo do usuário, o modelo inicial do banco de dados e a infraestrutura de trabalho.

## Funcionalidades previstas

### Cliente

- Consultar horários disponíveis;
- Informar data, horário e quantidade de pessoas;
- Realizar uma reserva;
- Consultar e cancelar suas reservas;
- Visualizar a confirmação da reserva.

### Funcionário/administrador

- Cadastrar e alterar mesas;
- Consultar as reservas do dia;
- Confirmar a chegada do cliente;
- Cancelar ou concluir uma reserva.

## Tecnologias propostas

- Front-end: HTML, CSS, JavaScript e Bootstrap;
- Back-end: Node.js com Express;
- Banco de dados: PostgreSQL;
- Prototipação: Figma;
- Versionamento: Git e GitHub;
- Kanban: GitHub Projects ou Trello.

As tecnologias podem ser ajustadas pela equipe antes do início da implementação.

## Estrutura do repositório

```text
pizzaria-reservas/
├── backend/        # API e regras de negócio
├── database/       # Modelo e scripts do banco
├── docs/           # Requisitos, protótipo e planejamento
├── frontend/       # Interface da aplicação
├── .editorconfig
├── .gitignore
└── README.md
```

## Como colaborar

1. Atualize a branch principal: `git pull origin main`;
2. Crie uma branch para a tarefa: `git switch -c feature/nome-da-tarefa`;
3. Faça commits pequenos e descritivos;
4. Envie a branch: `git push -u origin feature/nome-da-tarefa`;
5. Abra um Pull Request e peça a revisão de outro integrante.

Exemplos de commits:

```text
docs: adiciona requisitos da reserva
feat: cria formulário de reserva
fix: impede reserva em horário ocupado
```

## Documentação

- [Escopo e requisitos](docs/requisitos.md)
- [Fluxo de reserva](docs/fluxo-reserva.md)
- [Planejamento da prototipação](docs/prototipo.md)
- [Quadro Kanban inicial](docs/kanban.md)
- [Modelo inicial do banco](database/schema.sql)

## Equipe

Adicione aqui os nomes e as responsabilidades dos integrantes.

| Integrante | Responsabilidade inicial |
|---|---|
| Nome | A definir |

