# Pendências do frontend — integração com backend e foco em celular

## Implementação local para aprovação — 08/11/2026

Branch: `feat/reserva-sem-conta`, baseada em `9b582c6`. Entrega aprovada pelo responsável em 08/11/2026 para commit nesta branch, sem integração à `main`.

Concluído no frontend:

- [x] Reserva em duas etapas com resumo, retorno sem perder campos, mensagens de erro e foco no campo indicado.
- [x] Cadastro, edição de identificação/capacidade/área/situação e ativação/inativação de mesas, com estados de requisição. No modo demonstração, alterações persistem no navegador.
- [x] Filtros administrativos por status e previsão de chegada, além de data e busca; ordenação e paginação da lista diária.
- [x] URLs por tela, Voltar/Avançar, recarregamento, rolagem e foco ao navegar. O rascunho fica em memória durante a navegação; dados pessoais não são gravados para recuperar um formulário após fechar/recarregar a página.
- [x] Ajustes de legibilidade, áreas de toque, rótulos acessíveis, idioma pt-BR e título da página. O menu inferior é ocultado durante o foco em controles de entrada no celular para liberar espaço ao teclado.
- [x] Copiar link, com cópia manual como alternativa. Botão de compartilhamento removido a pedido do responsável em 08/11/2026.
- [x] Camada HTTP com cookies de sessão, CSRF, timeout, erros por campo, tratamento de 401/403/404/409, rejeição de respostas incompatíveis e chave de idempotência para criação.
- [x] Modo API sem fallback silencioso para simulação. No modo API as ações, o atraso, as políticas e a disponibilidade são informados pelo servidor.
- [x] Contrato proposto documentado em [contrato-api-frontend.md](contrato-api-frontend.md), incluindo contato configurável e exibição de mesa(s) atribuída(s).

Validação desta implementação: build e lint passaram; 18 testes automatizados passaram, cobrindo fluxos em Chrome, Edge, Firefox e WebKit e cenários de API simulada. Larguras verificadas: 320, 360, 390, 430, 768 e 1366 px no formulário, sem estouro horizontal nos testes. Capturas de celular foram geradas; a captura WebKit foi inspecionada visualmente. Isso não comprova funcionamento em Safari/iPhone físico nem integração com Django.

Ainda depende de backend, decisões ou validação externa:

- [ ] Aprovar e implementar o contrato no Django; substituir a demonstração por API configurada e testar ponta a ponta, inclusive em dois dispositivos.
- [ ] Garantir disponibilidade, capacidade, atribuição de mesa(s), transações, concorrência e permissões no servidor e banco. A simulação não fornece essas garantias.
- [ ] Aprovar o tratamento definitivo de ausência e os critérios de atribuição de uma ou mais mesas. Mantido o status atual de cancelamento, com suporte a motivo retornado pelo servidor.
- [ ] Configurar contato real e aprovar texto de uso de dados/política do estabelecimento.
- [ ] Testar rede lenta/timeout, sessão e links no ambiente HTTPS publicado, com o backend real.
- [ ] Validar em Android, iPhone e Samsung Internet reais, incluindo teclado, seleção nativa de data/hora, safe area e cópia do link.

As seções abaixo preservam o levantamento de 03/11 como referência. A lista acima é o estado atual da implementação para aprovação; as caixas históricas abaixo não foram usadas como comprovação de integração real.

Avaliação em 03/11/2026 da versão remota `dd0f7795a8ec9c8bc8ff5fa3273abdb890bcd8d4` da branch `main`.

Este documento registra o trabalho futuro. Nenhum código de aplicação foi alterado nesta avaliação.

## Direção adotada

O backend será a autoridade para disponibilidade, capacidade, dados válidos, autenticação, autorização, transições de status, atraso e cancelamento. O banco também deverá garantir consistência entre reservas concorrentes.

O frontend coleta dados, apresenta respostas e conduz a interação. Pode manter validações imediatas de preenchimento e formato para orientar o cliente; isso não substitui a validação no servidor. Não remover a confirmação visual de cancelamento nem os alertas só porque a decisão pertence ao backend.

Manter o fluxo já definido: visitante sem conta, nome e telefone na finalização e acesso à reserva por link exclusivo. SMS, WhatsApp e data de nascimento não são pendências do front para esse escopo.

## P0 — necessário para operação real

- [ ] Combinar com o backend os contratos de disponibilidade, criação, consulta pelo link, cancelamento, sessão da equipe, listagem administrativa e manutenção de mesas. Definir campos, respostas de erro e estados permitidos antes de integrar.
- [ ] Substituir `localStorage` como fonte das reservas por chamadas à API em `services/guestReservations.ts` e substituir `usePrototypeReservations`. A reserva precisa existir no servidor e ser consultável em outro navegador/dispositivo pelo mesmo link.
- [ ] Exibir carregamento ao consultar, confirmar, cancelar, autenticar e salvar mesas. Desabilitar a ação durante a requisição para reduzir cliques repetidos. A prevenção definitiva de duplicidades pertence ao backend.
- [ ] Só mostrar “Reserva confirmada” depois da resposta de sucesso do servidor, usando os dados e o identificador retornados por ele.
- [ ] Consultar disponibilidade conforme dia, quantidade de pessoas e área. Exibir indisponibilidade, alternativas retornadas pelo backend e conflito quando a disponibilidade mudar entre consulta e confirmação.
- [ ] Preservar os dados digitados em erros de rede ou de validação; associar os erros aos respectivos campos e levar o foco ao primeiro erro. Não limpar o formulário antes do sucesso.
- [ ] Distinguir falha de conexão de link inválido, reserva não encontrada e ação não permitida. Oferecer nova tentativa quando apropriado, sem confirmar novamente uma operação cujo resultado ficou incerto antes de consultar o servidor.
- [ ] Trocar o login demonstrativo da equipe pela API de autenticação. Recuperar a sessão ao abrir/recarregar `/equipe`, tratar sessão expirada e realizar logout no servidor.
- [ ] Apresentar as ações administrativas e de cancelamento conforme o estado/permissões informados pelo servidor, tratando rejeições posteriores. Ocultar botões não garante autorização.
- [ ] Implementar o formulário de “Cadastrar mesa”: o botão atual não possui ação.
- [ ] Completar edição de identificação, capacidade, área e ativação/inativação das mesas conforme contrato e requisitos finais. Atualizar a listagem com a resposta salva e manter histórico no backend.
- [ ] Substituir as mesas e situações demonstrativas por dados reais. Painel, mesas e reservas devem refletir a mesma situação do servidor após chegada, cancelamento e conclusão.
- [ ] Decidir com a equipe se o cliente escolhe mesa ou se o backend a atribui. Exibir a mesa atribuída onde o requisito exigir; suportar mais de uma mesa se essa possibilidade for aprovada. O frontend atual guarda apenas preferência de área.
- [ ] Receber do backend limites e políticas que precisem ser apresentados: horário de chegada, tamanho do grupo e tolerância. Evitar manter duas fontes independentes para as mesmas configurações.
- [ ] Exibir alertas e elegibilidade de liberação por ausência conforme dados do servidor. Se houver atualização periódica ou contador local, o relógio do aparelho não pode autorizar uma operação.
- [ ] Remover credenciais públicas, avisos e instruções de demonstração apenas na versão já integrada. Substituir orientações de link “somente neste navegador” pelo comportamento real.

Aceite: uma reserva criada em um navegador é consultável e cancelável em outro pelo link; a equipe a enxerga; uma rejeição do servidor nunca aparece como sucesso na interface.

## P1 — completar telas e navegação

- [ ] Adicionar filtros administrativos de status e previsão de chegada, além de data e busca existentes. Combinar paginação e ordenação com o backend para listas maiores.
- [ ] Alinhar o estado “Não compareceu” citado nos requisitos com o cancelamento por ausência atual. Definir nome, motivo e apresentação antes de integrar; refletir o resultado nos filtros e indicadores.
- [ ] Definir o comportamento de consulta após cancelamento, reserva passada, link inválido e eventual expiração/revogação do link, conforme contrato do backend.
- [ ] Oferecer contato acionável com a pizzaria na orientação de perda do link, com o canal real definido pelo estabelecimento.
- [ ] Dar suporte consistente a Voltar/Avançar e recarregamento por tela. A maior parte da navegação atual usa estado React e não cria entradas de histórico.
- [ ] Ao mudar de tela, ajustar rolagem e foco para o título/conteúdo principal; preservar o formulário se o cliente precisar corrigir uma informação.
- [ ] Corrigir `frontend/index.html`: `lang="pt-BR"` e título descritivo da pizzaria, hoje `lang="en"` e título `frontend`.
- [ ] Exibir políticas e orientações de uso de dados aprovadas pelo projeto junto à coleta, com texto curto e acesso à informação completa quando disponível.

## P1 — melhorias visuais para celular

A base responsiva está funcional. A recomendação é refinar o fluxo existente, sem redesenhar todas as telas.

- [ ] Reduzir o volume de texto e a altura acumulada do formulário. Na captura em 390 px de largura, a página completa mede cerca de 2.322 px, quase três telas de 844 px. Priorizar instruções curtas e agrupar detalhes da política em uma seção expansível acessível. O problema é de esforço de rolagem, não de quebra de layout.
- [ ] Avaliar um fluxo em duas etapas — “Sua reserva” e “Seus dados e confirmação” — com progresso claro, retorno sem perda dos dados e teste de usabilidade antes de adotá-lo.
- [ ] Melhorar a hierarquia do resumo final e a visibilidade da ação principal. Se houver ação fixa, reservar espaço para ela e para o menu inferior, incluindo área segura e teclado; não sobrepor conteúdo.
- [ ] Aumentar textos de apoio muito pequenos, especialmente descrições de área com 10 px e mensagens com 12 px. Adotar 14 px como meta de projeto para instruções importantes; manter campos com pelo menos 16 px.
- [ ] Aumentar a área de toque do botão de fechar a edição de mesa, hoje aproximadamente 13 × 20 px, e das opções de situação, hoje com 34 px de altura. Meta de projeto: pelo menos 44 × 44 px; preferir 48 px nos controles principais.
- [ ] Manter menu inferior com identificação clara da tela ativa e garantir que campos, erros, resumo e ações continuem alcançáveis quando o teclado virtual estiver aberto.
- [ ] Testar nome comprido, observação extensa, mensagens de erro de várias linhas, fonte ampliada e orientação horizontal. Não limitar a revisão ao conteúdo curto de demonstração.
- Descartado em 08/11/2026: botão “Compartilhar link”. Manter somente “Copiar link” e a alternativa de cópia manual.

Já presentes: layout em coluna no celular, menu inferior, campos com fonte de 16 px, controles principais com altura mínima de 48 px, configuração de área segura no menu e alternativa para falha ao copiar o link.

## Resultado dos testes executados

Testes automatizados em cópia temporária, usando dados fictícios e armazenamento local do protótipo. Compilação (`npm run build`) e lint (`npm run lint`) passaram.

| Navegador/motor | Versão executada | Resultado do fluxo testado |
| --- | --- | --- |
| Google Chrome | 156.0.8078.49 | Passou |
| Microsoft Edge | 156.0.4314.58 | Passou |
| Firefox para automação | 155.0 | Passou |
| WebKit para automação | 26.6 | Passou; não equivale a Safari em iPhone real |

Fluxo: abrir início, preencher e confirmar uma reserva futura, recarregar pelo link, desistir de um cancelamento, confirmar cancelamento, acessar a equipe, localizar a reserva pela data e abrir edição de mesa.

Não houve erros JavaScript não tratados nos fluxos executados. Em 390 px de largura, início, reserva, confirmação/consulta, cancelamento, reservas do dia e edição de mesas não apresentaram estouro horizontal. Formulário de reserva e edição de mesas também foram medidos em 320, 360, 390, 430, 768 e 1366 px: sem rolagem horizontal indevida nos quatro motores. As capturas de reserva em 320 e 390 px foram inspecionadas como apoio à avaliação visual.

Os testes usaram navegadores automatizados em desktop com larguras reduzidas. Não validam teclado virtual, seletor nativo de data/hora, barras dinâmicas, gestos ou área segura em aparelhos físicos. Também não validam a futura API, permissões reais, disponibilidade nem concorrência. O link ainda não funciona entre navegadores porque o armazenamento atual é local; isso é uma limitação conhecida do protótipo, não uma incompatibilidade do navegador.

## Validação necessária antes de publicar

- [ ] Android real: Chrome, incluindo teclado, seleção de data/hora, botão voltar do sistema, copiar/compartilhar link e reabertura por outro aplicativo.
- [ ] iPhone real: Safari, incluindo teclado, zoom ao focar, data/hora, menu inferior com barras do navegador, recortes/área segura e copiar/compartilhar link.
- [ ] Samsung Internet, caso esteja no público atendido, com o fluxo principal de reserva e consulta.
- [ ] Publicação em HTTPS: copiar/compartilhar link, abrir diretamente o link exclusivo e `/equipe`, recarregar e usar Voltar/Avançar. Verificar configuração de entrega da aplicação pelo servidor.
- [ ] Rede lenta, perda de conexão, resposta inválida e sessão expirada com a API real. Nenhuma falha deve apagar dados ou exibir confirmação indevida.
- [ ] Dois dispositivos disputando a última mesa: o backend aceita somente a operação válida e o frontend orienta o cliente que recebeu a rejeição.
- [ ] Um navegador cria a reserva, outro abre o link e cancela; painel da equipe atualiza a situação.
- [ ] Navegação por teclado, foco visível, leitor de tela, ampliação de texto e mensagens de erro acessíveis.

## Ordem sugerida

1. Definir contratos da API e decisões de mesa/status.
2. Completar formulários de mesas e estados de carregamento/erro.
3. Aplicar ajustes de legibilidade, toque, navegação e foco no celular.
4. Integrar reserva, links, equipe e mesas ao backend.
5. Repetir os testes entre navegadores e executar a validação em Android/iPhone reais e HTTPS.
