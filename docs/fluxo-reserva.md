# Fluxo principal de reserva

```text
Página inicial
  → informar data, horário e número de pessoas
  → consultar disponibilidade
  → selecionar uma opção disponível
  → informar nome e telefone com DDD (sem criar conta ou senha)
  → revisar os dados
  → confirmar a reserva
  → visualizar o código e o resumo da reserva
  → salvar o link exclusivo para consultar ou cancelar esta reserva
```

## Fluxos alternativos

- Sem disponibilidade: sugerir outro horário ou data;
- Grupo maior que a capacidade: informar o limite e oferecer outra mesa;
- Dados inválidos: destacar os campos que precisam ser corrigidos;
- Cancelamento: pedir confirmação antes de alterar o status da reserva.

## Acesso sem conta

- O cliente navega e escolhe os dados da reserva sem login.
- Nome e telefone são solicitados somente ao finalizar; não há data de nascimento, envio de códigos ou mensagens.
- Cada reserva recebe um token aleatório de 256 bits no link. O código curto exibido é apenas uma referência, sem conceder acesso.
- O link permite consultar e cancelar somente a reserva correspondente. O telefone não permite consultar o histórico.
- O cancelamento exige confirmação e só está disponível antes do horário reservado.
- Link perdido: orientar contato com a pizzaria. Link inválido: não exibir dados.
- Funcionários continuam com uma tela de acesso própria.

## Limites do protótipo

O frontend guarda os testes em localStorage, sem backend. Os links funcionam somente no mesmo navegador e endereço (incluindo porta), e os dados desaparecem ao limpar o armazenamento. Use dados fictícios. O painel administrativo continua com exemplos independentes, e os horários não representam disponibilidade real.

Em produção, mover criação, leitura, validação e cancelamento para a API, armazenar apenas o hash dos tokens, definir expiração, aplicar HTTPS e limites contra automação, validar conflitos de disponibilidade em transação e autenticar a equipe no servidor. O link deverá funcionar em outros dispositivos por meio dessa API.

