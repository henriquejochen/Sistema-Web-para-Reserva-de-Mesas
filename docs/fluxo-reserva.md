# Fluxo principal de reserva

```text
Página inicial
  → informar dia e número de pessoas
  → consultar disponibilidade
  → selecionar uma opção disponível
  → informar previsão de chegada (para recepção, sem faixas de disponibilidade)
  → informar nome e telefone com DDD (sem criar conta ou senha)
  → revisar os dados
  → confirmar a reserva
  → visualizar o código e o resumo da reserva
  → salvar o link exclusivo para consultar ou cancelar esta reserva
```

## Fluxos alternativos

- Sem disponibilidade: sugerir outra data;
- Grupo maior que a capacidade: informar o limite e oferecer outra mesa;
- Dados inválidos: destacar os campos que precisam ser corrigidos;
- Cancelamento: pedir confirmação antes de alterar o status da reserva.

## Acesso sem conta

- O cliente navega e escolhe os dados da reserva sem login.
- Nome e telefone são solicitados somente ao finalizar; não há data de nascimento, envio de códigos ou mensagens.
- Cada reserva recebe um token aleatório de 256 bits no link. O código curto exibido é apenas uma referência, sem conceder acesso.
- O link permite consultar e cancelar somente a reserva correspondente. O telefone não permite consultar o histórico.
- O cancelamento pelo cliente exige confirmação e fica disponível para reservas confirmadas cujo dia ainda não passou.
- Link perdido: orientar contato com a pizzaria. Link inválido: não exibir dados.
- Funcionários acessam diretamente `/equipe`, sem botão no site público, com usuário e senha (simulados no protótipo).

## Previsão de chegada e ausência

A pizzaria recebe reservas todos os dias. O rodízio acontece de quarta a sábado. A reserva é feita por dia; a previsão de chegada não cria faixas de disponibilidade.

A equipe vê a previsão no painel e na listagem por dia. Após 15 minutos de atraso, recebe um alerta visual. Após 30 minutos, pode confirmar o cancelamento por ausência para realocar a mesa. Nada é cancelado automaticamente. A regra usa data e horário completos e só vale para grupos com status Confirmada. Reservas antigas sem previsão não são liberadas por atraso.

## Limites do protótipo

O frontend guarda os testes em localStorage, sem backend. Os links funcionam somente no mesmo navegador e endereço (incluindo porta), e os dados desaparecem ao limpar o armazenamento. Use dados fictícios. O painel administrativo lê as reservas locais e suas previsões de chegada. A alocação física e os estados das mesas continuam demonstrativos. Não há disponibilidade real.

Em produção, mover criação, leitura, validação e cancelamento para a API, armazenar apenas o hash dos tokens, definir expiração, aplicar HTTPS e limites contra automação, validar conflitos de disponibilidade em transação e autenticar a equipe no servidor. O link deverá funcionar em outros dispositivos por meio dessa API.

