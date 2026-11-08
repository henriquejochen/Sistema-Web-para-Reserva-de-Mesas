# Front-end

## Atualização para aprovação — 08/11/2026

Fluxo de reserva em duas etapas, gestão de mesas com cadastro/edição/inativação, filtros de reservas por status e chegada, navegação por URLs e suporte a Voltar/Avançar. Campos mantêm seus valores em falhas e entre as etapas. A interface exibe estados de requisição, respostas de conflito e permissões fornecidas pela API.

Sem `VITE_API_BASE_URL`, o modo é demonstrativo e identificado. Mesas e reservas são locais; a sessão demonstrativa dura na aba. Com a variável configurada, usa HTTP sem fallback para demonstração. O backend ainda precisa ser implementado conforme [contrato proposto](../docs/contrato-api-frontend.md).

`npm run build` compila; `npm run lint` verifica o código. Para testes de navegador: `npm ci`, `npx playwright install firefox webkit` e `npm run test:browser`. Chrome e Edge precisam estar instalados; Firefox e WebKit usam os motores do Playwright. A suíte inicia servidores nas portas 4173 e 4174 e usa dados fictícios/respostas de API simuladas. Testes reais com Django e aparelhos físicos continuam necessários.

O registro abaixo descreve o protótipo original; onde houver diferença, valem esta atualização e o contrato proposto.

Protótipo React + TypeScript + Vite da Pizzaria Di Napoli. Execute `npm ci` e `npm run dev`. Verifique a compilação com `npm run build`.

## Reserva por dia, sem conta

1. O cliente abre o site sem login e escolhe “Reservar mesa”.
2. Escolhe uma data a partir de hoje (todos os dias da semana), número de pessoas e área preferida. Rodízio apenas de quarta a sábado.
3. Informa a previsão de chegada. Esse horário orienta a recepção e o cálculo de atraso; não divide disponibilidade em faixas.
4. Informa nome fictício e telefone com DDD de 10 ou 11 dígitos e confirma.
5. Salva o link exclusivo. Reabrir no mesmo navegador e endereço recupera a reserva, inclusive após recarregar.
6. “Consultar reserva” exige esse link; não mostra histórico pelo telefone. O cliente pode confirmar ou desistir do cancelamento.

## Equipe

Acesse diretamente `/equipe`. Não existe botão no site público. Usuário de demonstração: `equipe`; senha: `napoli-demo`. A autenticação é simulada; recarregar a área da equipe exige entrar novamente. O endereço separado não é um controle de segurança.

O painel lê as reservas criadas neste navegador. Em “Reservas do dia”, escolha a data da reserva e teste a busca, confirmação da chegada e conclusão do atendimento. Os atrasos são calculados a partir da data e previsão de chegada e atualizados a cada 30 segundos.

Após 15 minutos, há um alerta. Após 30 minutos, uma reserva confirmada sem chegada pode ser cancelada por ausência pelo botão “Liberar por ausência”, com confirmação. Nada é cancelado automaticamente. Grupos presentes ou atendimentos concluídos não podem ser liberados por ausência. A alocação física e os estados das mesas continuam demonstrativos e independentes.

Reservas antigas sem previsão de chegada continuam acessíveis, mas não recebem alertas de atraso. Links antigos com horário usam esse horário como previsão de chegada.

## Limites

Use apenas dados fictícios. Não são enviadas mensagens e não há backend ou controle real de disponibilidade. Os registros ficam no localStorage deste navegador e endereço; não funcionam em outros dispositivos e desaparecem ao limpar o armazenamento. A API deverá autenticar a equipe e validar autorização, dados, disponibilidade por dia e cancelamentos no servidor. O modelo de banco inicial ainda precisa acompanhar esse fluxo.
