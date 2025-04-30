# ADR 001: Adoção de RabbitMQ para Integração entre Microsserviços

Data: 2025-04-30
Status: Proposed  
Local: `docs/adrs/001-adoção-rabbitmq.md`

## 1. Contexto e Motivação

Atualmente o serviço de gerenciamento de tarefas (`lq-services-management-service`) precisa:  
1. Integrar-se inicialmente com outros microsserviços via eventos de domínio (por exemplo, **sales.sale.created**) para criação de tarefas e schedules.  
2. Posteriormente expandir para envio de notificações e outros fluxos assíncronos.  

## 2. Drivers da Decisão

- **Escalabilidade**: processamento assíncrono desacoplado de picos de carga.  
- **Confiabilidade**: confirmação manual (ack/nack) de consumo para evitar perda ou duplicação.  
- **Flexibilidade**: suporte a topologias de tópicos (pub/sub) e futuras integrações (notificações, relatórios).  
- **Observabilidade**: métricas de fila, latência e throughput.  
- **Modularidade**: permitir consumo manual via `amqplib` para controle fino de exchanges e roteamentos.

## 3. Opções Consideradas

### 3.1 NestJS RMQ (Transport.RMQ + @EventPattern)

Prós:
- Integração direta com NestJS, abstração de conexão e reconexão.  
- Sintaxe declarativa via decoradores.  

Contras:
- Limitações no roteamento avançado por **exchange type** e **routingKey**.  
- Dificuldade de configuração de backoff e reconexão customizada.  
- Desacoplamento reduzido de detalhes de broker.

### 3.2 Abordagem Manual com `amqplib`

Prós:
- Controle completo sobre conexões, canal, reconexão e backoff exponencial.  
- Roteamento flexível via exchanges do tipo **topic** e binding key.  
- Tratamento explícito de `ack`, `nack` e DLQs.  

Contras:
- Maior volume de código boilerplate.  
- Necessita implementar lógica de reconexão e monitoração.

## 4. Decisão Tomada

Adotar a **abordagem manual** utilizando a biblioteca `amqplib` para:  
- Consumir tópicos definidos via **exchange** do tipo `topic`.  
- Garantir controle explícito de `ack`/`nack`, reconexão com backoff e métricas.  
- Manter serviços de handler limpos, sem decoradores `@EventPattern`.

## 5. Detalhes de Implementação

### 5.1 Organização de Módulos e Serviços

- **RabbitmqModule**
  - Provider: `RabbitmqConsumerService`
  - Exporta: `RabbitmqConsumerService`
  - Importa: módulos de domínio (e.g. `SchedulesModule`, `TasksModule`)

- **Handler de Eventos**
  - Serviços existentes (e.g. `SalesEventHandlerService`) renomeados para `processSaleCreated(payload: SaleCreatedDto)` sem decoradores.

### 5.2 Configuração de Ambiente

- Variável única: `RABBITMQ_URL` (contendo host, porta, vhost e credenciais).  
- Opcional: `RABBITMQ_PREFETCH` (número de mensagens não confirmadas simultâneas).

- Auto-configurável no bootstrap: o `RabbitmqConsumerService` usa o `ConfigService` para obter `RABBITMQ_URL`, conecta ao broker, cria canal e declara exchanges/queues dinamicamente sem configuração manual adicional.  
- Reconexão e backoff exponencial: eventos de `error` e `close` disparam método `reconnect()`, implementando retry com delay inicial de 5s que dobra até 60s.  
- Shutdown gracioso: em `OnApplicationShutdown`, canal e conexão são fechados ordenadamente para evitar perda de mensagens.

### 5.3 Topologia de Exchange e Queue

```yaml
exchange:
  name: lq_events_exchange
  type: topic

queues:
  - name: create-tasks-schedules-queue
    bindingKey: sales.sale.created
    options:
      durable: true
      deadLetterExchange: dlx.sales
```

#### 5.3.1 Definição de Constantes
Para facilitar a manutenção, definimos em `src/rabbitmq/rabbitmq.constants.ts` as seguintes constantes utilizadas no código:
```typescript
export const RABBITMQ_EXCHANGE_NAME = 'lq_events_exchange';
export const SALE_CREATED_ROUTING_KEY = 'sales.sale.created';
export const CREATE_TASKS_SCHEDULES_QUEUE = 'create-tasks-schedules-queue';
```

### 5.4 Fluxo de Consumo

1. `OnApplicationBootstrap` em `RabbitmqConsumerService`:
   - Conecta em `amqplib.connect(RABBITMQ_URL)`.
   - Cria canal (`createChannel()`), define prefetch.
   - Declara exchange e queue, faz `bindQueue()`.
   - Inicia `channel.consume()` com callback genérico.

2. **Callback de mensagem**:
   - Parseia `msg.fields.routingKey` e `JSON.parse(msg.content.toString())`.
   - Roteia para handler apropriado (e.g. `SalesEventHandlerService.processSaleCreated(dto)`).
   - On success: `channel.ack(msg)`.
   - On error: `channel.nack(msg, false, false)` (sem requeue para evitar loop).  
   - Log e métricas (Prometheus): latência, contagem de ack/nack.

3. `OnApplicationShutdown`:
   - Fecha canal e conexão graciosamente.

### 5.5 Idempotência e Deduplicação

- Incluir no payload um `eventId` ou `saleId` único.  
- Antes de criar `Task` e `Schedule`, verificar tabela de **event_history** ou índice único para `saleId` + `itemId`.  
- Registrar status de processamento para evitar duplicação.

## 6. Consequências

- **Ponto Positivo**: alto grau de controle e extensibilidade para cenários complexos de roteamento.  
- **Risco**: maior esforço de manutenção do código de conexão e reconexão.  
- **Ganho de Observabilidade**: métricas customizadas de filas e eventos.  

## 7. Próximos Passos

1. Implementar `RabbitmqModule` e `RabbitmqConsumerService`.  
2. Adaptar handlers de eventos sem `@EventPattern`.  
3. Criar DTOs (`SaleCreatedDto`) e registrar `event_history`.  
4. Construir testes unitários e de integração (e2e) simulando mensagens RabbitMQ.  
5. Monitoramento e dashboards (futuro ADR para alertas e SLIs).

## 8. Referências

- RabbitMQ AMQP 0-9-1 tutorial: [RabbitMQ Hello World (Python)](https://www.rabbitmq.com/tutorials/tutorial-one-python)  
- Prática de ADR: [Anselme – Architectural Decision Record](https://www.anselme.com.br/2024/02/27/architectural-decision-record/) 