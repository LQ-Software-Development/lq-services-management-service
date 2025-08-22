# ADR 002: Requisito de Payload de sales.sale.confirmed para Criação de Tasks

Data: 2025-05-01
Status: Proposed  
Local: `docs/adrs/002-requisito-payload-task.md`

## 1. Contexto

O microsserviço de gerenciamento de tarefas (`lq-services-management-service`) consome eventos de domínio via RabbitMQ, especialmente o evento `sales.sale.confirmed`, para automatizar a criação de Tasks e Schedules. Atualmente, tasks só podem ser vinculadas a um projeto, mas há necessidade de permitir tasks soltas, associadas apenas a uma organização.

## 2. Problema

- Nem todo fluxo de venda está associado a um projeto existente no sistema.
- Ainda assim, toda Task resultado do evento deve pertencer a uma entidade de contexto: um `projectId` ou, quando não houver projeto, um `organizationId`.
- Falta de validação clara no payload pode levar à criação de Tasks órfãs sem contexto.

## 3. Drivers de Decisão

- **Flexibilidade**: suportar cenários de tasks soltas sem vínculo a projetos.
- **Consistência**: garantir contexto mínimo (projeto ou organização) para toda Task.
- **Validação**: evitar dados inválidos e tasks órfãs.
- **Idempotência**: permitir rastrear eventos via um `saleId`.

## 4. Decisão Tomada

Definir que o payload do evento `sales.sale.confirmed` deve incluir:

- **saleId** (string, obrigatório): Identificador único da venda.
- **projectId** (UUID, opcional): Identificador do projeto associado. Se ausente, deve existir **organizationId**.
- **organizationId** (UUID, opcional): Identificador da organização. Se ausente, deve existir **projectId**.

**Regra de Negócio**: o payload deve conter pelo menos um entre `projectId` ou `organizationId`. Caso contrário, o consumidor rejeitará a mensagem (chamada a `nack` sem requeue) e registrará erro no log.

## 5. Consequências

- Mensagens sem contexto serão rejeitadas e reportadas, evitando criação de Tasks órfãs.
- Necessidade de validação adicional no RabbitmqConsumerService antes de chamar o serviço de criação.

## 6. Próximos Passos

1. Implementar validação do payload em `RabbitmqConsumerService`.
2. Ajustar DTO `SaleConfirmedDto` para refletir campos obrigatórios/opcionais.
3. Atualizar testes unitários e de integração para cobrir cenários com/sem `projectId`.
4. Realizar deploy e monitorar mensagens rejeitadas. 