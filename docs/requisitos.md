# Escopo e requisitos

## Problema

Atualmente, muitas reservas de mesas são feitas por telefone ou WhatsApp. Esse processo pode gerar demora no atendimento, perda de informações, dificuldade para consultar reservas futuras e conflitos de horário, principalmente quando mais de um funcionário atende os clientes.

A aplicação tem como objetivo centralizar o processo de reserva de mesas em uma pizzaria, permitindo que clientes consultem disponibilidade e realizem reservas, enquanto funcionários e administradores acompanham e gerenciam a ocupação das mesas.

## Público-alvo

- Clientes que desejam reservar uma mesa antecipadamente.
- Funcionários responsáveis por organizar mesas e acompanhar reservas.
- Administradores responsáveis pelo cadastro de mesas e controle geral do sistema.

## Requisitos funcionais

RF01 - O sistema deve permitir que o cliente consulte a disponibilidade de mesas informando dia e quantidade de pessoas.

RF02 - O sistema deve apresentar ao cliente as opções de mesas disponíveis para o dia conforme os dados informados na consulta.

RF03 - O sistema deve solicitar nome e telefone com DDD somente ao finalizar a reserva, sem exigir conta, senha ou data de nascimento.

RF04 - O sistema deve permitir que o cliente confirme uma reserva após revisar os dados informados, incluindo a previsão de chegada.

RF05 - O sistema deve gerar uma confirmação da reserva contendo data, previsão de chegada, quantidade de pessoas, mesa reservada e código da reserva.

RF06 - O sistema deve permitir que o cliente consulte uma reserva por seu link exclusivo, sem liberar histórico pelo telefone ou pelo código curto da reserva.

RF07 - O sistema deve permitir que o cliente cancele uma reserva futura pelo link exclusivo, solicitando confirmação. Se perder o link, deve ser orientado a contatar a pizzaria.

RF08 - O sistema deve permitir que o administrador cadastre novas mesas.

RF09 - O sistema deve permitir que o administrador edite informações de uma mesa, como identificação, capacidade e status.

RF10 - O sistema deve permitir que o administrador inative mesas que não devem receber novas reservas.

RF11 - O sistema deve permitir que o administrador visualize as reservas do dia.

RF12 - O sistema deve permitir que o administrador filtre reservas por data, horário, cliente ou status.

RF13 - O sistema deve permitir que o administrador altere o status de uma reserva, como confirmada, cancelada, concluída ou não compareceu.

RF14 - O sistema deve permitir que o funcionário confirme a chegada do cliente ao estabelecimento.

RF15 - O sistema deve impedir o cadastro de reservas com conflito de disponibilidade no dia para a mesma mesa.

RF16 - O sistema deve validar se a mesa escolhida possui capacidade suficiente para a quantidade de pessoas informada.

RF17 - O sistema deve exibir mensagens de erro quando os dados informados forem inválidos ou quando não houver disponibilidade.

RF18 - O sistema deve permitir que o administrador visualize um resumo da ocupação das mesas.

## Requisitos não funcionais

RNF01 - A aplicação deve possuir interface responsiva, funcionando corretamente em celulares, tablets e computadores.

RNF02 - A interface deve ser simples, intuitiva e adequada para usuários com diferentes níveis de familiaridade com tecnologia.

RNF03 - O sistema deve apresentar mensagens claras de sucesso, erro e confirmação para orientar o usuário durante o uso.

RNF04 - O sistema deve armazenar senhas de forma segura, utilizando criptografia ou mecanismo de hash, nunca em texto puro.

RNF05 - O sistema deve proteger dados pessoais dos clientes, permitindo acesso somente a usuários autorizados.

RNF06 - O sistema deve validar os dados enviados pelo usuário tanto no front-end quanto no back-end.

RNF07 - O sistema deve responder às principais ações do usuário em tempo adequado, evitando longas esperas em consultas e confirmações.

RNF08 - O sistema deve possuir boa legibilidade, contraste adequado, rótulos em campos de formulário e navegação compreensível.

RNF09 - O sistema deve ser desenvolvido com tecnologias web, utilizando front-end, back-end e banco de dados separados.

RNF10 - O sistema deve utilizar banco de dados relacional para armazenar clientes, mesas e reservas.

RNF11 - O sistema deve permitir manutenção futura, com código organizado em camadas ou módulos.

RNF12 - O sistema deve manter consistência dos dados mesmo quando duas pessoas tentarem reservar a mesma mesa no mesmo horário.

RNF13 - O sistema deve registrar datas importantes das reservas, como data de criação, atualização e cancelamento, quando aplicável.

RNF14 - O sistema deve restringir funcionalidades administrativas apenas a funcionários ou administradores autenticados.

RNF15 - A aplicação deve ser compatível com navegadores modernos.

## Regras de negócio

RN01 - Uma mesa não pode possuir duas reservas ativas no mesmo dia.

RN02 - Uma reserva só pode ser criada se existir pelo menos uma mesa ativa disponível para o dia e a quantidade de pessoas informados.

RN03 - A quantidade de pessoas da reserva não pode ser maior que a capacidade da mesa selecionada.

RN04 - Mesas inativas não podem ser exibidas como disponíveis para novas reservas.

RN05 - O cliente deve informar dados obrigatórios para concluir uma reserva, como nome e telefone.

RN06 - Uma reserva deve possuir um status para indicar sua situação atual.

RN07 - Os status básicos de uma reserva devem incluir: confirmada, cancelada, concluída e não compareceu.

RN08 - Reservas canceladas não devem bloquear a disponibilidade da mesa para o mesmo horário.

RN09 - Reservas concluídas representam atendimentos já finalizados e não podem ser canceladas pelo cliente.

RN10 - O cliente só pode cancelar reservas futuras.

RN11 - O sistema deve solicitar confirmação antes de cancelar uma reserva.

RN12 - O administrador pode alterar o status de reservas conforme o andamento do atendimento.

RN13 - A chegada do cliente deve ser confirmada por um funcionário ou administrador.

RN14 - Caso não exista mesa disponível para o horário solicitado, o sistema deve informar a indisponibilidade e sugerir que o cliente escolha outra data ou horário.

RN15 - O sistema deve considerar o dia da reserva para validar disponibilidade; a previsão de chegada serve somente para recepção e atraso.

RN16 - Não deve ser permitido criar reserva com data ou previsão de chegada inválida.

RN17 - O código da reserva deve ser único, permitindo identificar a reserva posteriormente.

RN18 - Alterações em mesas, como capacidade ou inativação, não devem apagar o histórico de reservas já realizadas.

RN19 - Apenas usuários administrativos podem cadastrar, editar ou inativar mesas.

RN20 - Apenas usuários administrativos podem visualizar o painel geral de reservas.

RN21 - A pizzaria aceita reservas todos os dias. O rodízio funciona de quarta a sábado.

RN22 - O cliente deve informar uma previsão de chegada. Essa informação não divide a reserva em faixas de horário.

RN23 - Após 15 minutos de atraso, a equipe recebe um alerta visual. Após 30 minutos, pode confirmar o cancelamento por ausência para realocar a mesa; essa ação não é automática e não se aplica a grupos presentes ou concluídos.

## Atores do sistema

- Cliente: consulta disponibilidade, realiza reservas, consulta suas reservas e cancela reservas futuras.
- Funcionário: acompanha reservas do dia e confirma a chegada dos clientes.
- Administrador: gerencia mesas, acompanha reservas e altera status das reservas.

## Prioridade inicial

Para a primeira versão do sistema, a prioridade deve ser:

1. Consulta de disponibilidade.
2. Cadastro e confirmação de reserva.
3. Validação de conflito de disponibilidade por dia.
4. Validação da capacidade da mesa.
5. Consulta e cancelamento de reservas pelo cliente.
6. Painel administrativo para visualização e atualização de reservas.
7. Cadastro e manutenção de mesas.
