# Front-end

Protótipo React + TypeScript + Vite da Pizzaria Di Napoli.

Para executar: `npm ci` e `npm run dev`. Para verificar a compilação: `npm run build`.

## Reserva sem conta

1. O site abre na página do cliente; clique em “Reservar mesa”.
2. Escolha uma data futura de quarta a sábado, horário livre e número de pessoas.
3. Informe nome fictício e telefone com DDD de 10 ou 11 dígitos. Confirme.
4. Copie o link exclusivo. Reabra no mesmo navegador para consultar a mesma reserva, inclusive após recarregar.
5. Teste “Cancelar reserva”, “Manter reserva” e a confirmação do cancelamento; recarregue e confira que o status continua cancelado.
6. Abra o início sem o fragmento do link: “Consultar reserva” solicita o link e não lista outros clientes. Um link alterado não deve exibir dados.
7. “Acesso da equipe” abre o login administrativo simulado, sem cadastro de clientes.

Não são enviadas mensagens. Os registros ficam apenas no localStorage deste navegador e endereço. Links não funcionam em outros dispositivos; limpar o armazenamento remove os testes. Use somente dados fictícios. Horários e painel administrativo permanecem demonstrativos. A integração com API e banco de dados ainda precisa ser implementada, conforme `docs/fluxo-reserva.md`.

