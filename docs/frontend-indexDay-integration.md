# Integração Frontend: Sistema de Reordenação por Dia (indexDay)

## 📋 Contexto

O sistema de agendamentos (schedules) possui um calendário onde cada dia exibe uma lista de cards de serviços. Foi implementado um sistema de reordenação que permite arrastar e soltar cards **dentro de um dia específico** para reorganizar a ordem de exibição.

## 🎯 O Que Foi Implementado no Backend

### Novos Campos na Entidade Schedule

```typescript
{
  id: "uuid",
  date: "2025-12-10T10:00:00Z",
  index: 1,        // ← Campo EXISTENTE (índice global de todos os schedules)
  indexDay: 1,     // ← Campo NOVO (índice dentro do dia específico)
  // ... outros campos
}
```

**Diferença entre `index` e `indexDay`:**

- **`index`**: Posição global na organização (1, 2, 3, 4, 5, 6, 7, 8...)
  - Usado por outras aplicações que já estão em produção
  - **NÃO DEVE SER MODIFICADO** pela funcionalidade de calendário
- **`indexDay`**: Posição dentro do dia específico (cada dia reinicia em 1)
  - Dia 10/12: schedules com indexDay 1, 2, 3
  - Dia 11/12: schedules com indexDay 1, 2, 3, 4
  - **ESTE É O CAMPO que você deve usar** para ordenação no calendário

---

## 🔄 Como Funciona a Reordenação

### Endpoint para Reordenar

```
PUT /schedules/reorder-day
Content-Type: application/json
```

### Payload Simplificado

O backend faz todo o trabalho pesado. Você só precisa enviar 3 informações:

```json
{
  "date": "2025-12-10",
  "movedItemId": "550e8400-e29b-41d4-a716-446655440000",
  "newPosition": 1
}
```

**Campos:**

- `date` (string): Data no formato `YYYY-MM-DD` dos schedules sendo reordenados
- `movedItemId` (string): UUID do schedule que foi arrastado
- `newPosition` (number): Nova posição desejada (1 = topo, 2 = segundo, etc.)

### O Backend Automaticamente:

1. ✅ Busca todos os schedules daquele dia
2. ✅ Remove o item da posição atual
3. ✅ Insere na nova posição
4. ✅ Recalcula TODOS os `indexDay` sequencialmente (1, 2, 3, 4...)
5. ✅ Salva tudo em transação atômica (tudo ou nada)
6. ✅ Retorna a nova ordem completa

---

## 💻 Implementação no Frontend

### 1. Exibir Schedules Ordenados por `indexDay`

Ao buscar schedules de um dia específico:

```typescript
// GET /schedules?startDate=2025-12-10&endDate=2025-12-10
const response = await fetch(
  "/schedules?startDate=2025-12-10&endDate=2025-12-10",
);
const { data } = await response.json();

// Ordenar por indexDay ANTES de renderizar
const schedulesOrdenados = data.sort((a, b) => {
  // Schedules sem indexDay vão para o final
  if (!a.indexDay) return 1;
  if (!b.indexDay) return -1;
  return a.indexDay - b.indexDay;
});

// Agora renderizar schedulesOrdenados no calendário
```

### 2. Implementar Drag and Drop

Exemplo com biblioteca de drag-and-drop (conceito genérico):

```typescript
const handleDragEnd = async (event) => {
  // event contém:
  // - itemId: UUID do schedule que foi arrastado
  // - oldIndex: índice anterior (0-based do array)
  // - newIndex: novo índice (0-based do array)

  const movedItemId = event.itemId;
  const newPosition = event.newIndex + 1; // +1 porque backend usa 1-based
  const date = getCurrentDayDate(); // "2025-12-10"

  try {
    const response = await fetch("/schedules/reorder-day", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        movedItemId,
        newPosition,
      }),
    });

    const result = await response.json();

    // Backend retorna a nova ordem:
    // {
    //   message: "Schedule reordered successfully for the day",
    //   updatedSchedules: [
    //     { id: "uuid-1", indexDay: 1 },
    //     { id: "uuid-2", indexDay: 2 },
    //     { id: "uuid-3", indexDay: 3 }
    //   ]
    // }

    // Atualizar estado local com nova ordem
    updateSchedulesWithNewOrder(result.updatedSchedules);
  } catch (error) {
    console.error("Erro ao reordenar:", error);
    // Reverter UI para estado anterior (rollback visual)
    revertDragAndDrop();
  }
};
```

### 3. Atualizar Estado Local

Após sucesso da requisição, atualizar seus schedules com os novos `indexDay`:

```typescript
function updateSchedulesWithNewOrder(updatedSchedules) {
  // updatedSchedules = [{ id: "uuid", indexDay: 1 }, ...]

  setSchedules(
    (prevSchedules) =>
      prevSchedules
        .map((schedule) => {
          const updated = updatedSchedules.find((u) => u.id === schedule.id);
          if (updated) {
            return { ...schedule, indexDay: updated.indexDay };
          }
          return schedule;
        })
        .sort((a, b) => a.indexDay - b.indexDay), // Re-ordenar
  );
}
```

---

## 📝 Exemplos Práticos de Uso

### Cenário 1: Arrastar do Final para o Topo

**Estado inicial (dia 10/12/2025):**

```
1. Schedule A (id: aaa-111, indexDay: 1)
2. Schedule B (id: bbb-222, indexDay: 2)
3. Schedule C (id: ccc-333, indexDay: 3)
4. Schedule D (id: ddd-444, indexDay: 4)
```

**Usuário arrasta Schedule D para o topo:**

```typescript
// Frontend envia:
{
  "date": "2025-12-10",
  "movedItemId": "ddd-444",
  "newPosition": 1
}

// Backend responde:
{
  "updatedSchedules": [
    { "id": "ddd-444", "indexDay": 1 },  // ← movido
    { "id": "aaa-111", "indexDay": 2 },  // ← desceu
    { "id": "bbb-222", "indexDay": 3 },  // ← desceu
    { "id": "ccc-333", "indexDay": 4 }   // ← desceu
  ]
}
```

**Novo estado no calendário:**

```
1. Schedule D (indexDay: 1) ✅
2. Schedule A (indexDay: 2)
3. Schedule B (indexDay: 3)
4. Schedule C (indexDay: 4)
```

### Cenário 2: Arrastar do Topo para o Meio

**Estado inicial:**

```
1. Schedule A (id: aaa-111, indexDay: 1)
2. Schedule B (id: bbb-222, indexDay: 2)
3. Schedule C (id: ccc-333, indexDay: 3)
4. Schedule D (id: ddd-444, indexDay: 4)
```

**Usuário arrasta Schedule A para posição 3:**

```typescript
// Frontend envia:
{
  "date": "2025-12-10",
  "movedItemId": "aaa-111",
  "newPosition": 3
}

// Backend responde:
{
  "updatedSchedules": [
    { "id": "bbb-222", "indexDay": 1 },  // ← subiu
    { "id": "ccc-333", "indexDay": 2 },  // ← subiu
    { "id": "aaa-111", "indexDay": 3 },  // ← movido
    { "id": "ddd-444", "indexDay": 4 }
  ]
}
```

---

## ⚠️ Importantes Considerações

### 1. **Posições São 1-Based**

```typescript
// ❌ ERRADO - Enviar índice 0-based do array
const newPosition = event.newIndex; // 0, 1, 2...

// ✅ CORRETO - Converter para 1-based
const newPosition = event.newIndex + 1; // 1, 2, 3...
```

### 2. **Sempre Ordenar por `indexDay`**

```typescript
// Ao buscar schedules do dia
schedules.sort((a, b) => a.indexDay - b.indexDay);

// Tratar schedules sem indexDay (dados antigos)
schedules.sort((a, b) => {
  if (!a.indexDay) return 1;
  if (!b.indexDay) return -1;
  return a.indexDay - b.indexDay;
});
```

### 3. **Lidar com Erros de Validação**

```typescript
// Possíveis erros do backend:
try {
  const response = await fetch("/schedules/reorder-day", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();

    // 404: Schedule não encontrado naquele dia
    if (response.status === 404) {
      showError("Item não encontrado no dia selecionado");
    }

    // 400: Posição inválida
    if (response.status === 400) {
      showError("Posição inválida para reordenação");
    }
  }
} catch (error) {
  // Erro de rede ou servidor
  showError("Erro ao reordenar. Tente novamente.");
  revertDragAndDrop(); // Reverter UI
}
```

### 4. **Otimistic Update (Opcional)**

Para melhor UX, você pode atualizar a UI imediatamente e reverter se falhar:

```typescript
const handleDragEnd = async (event) => {
  // 1. Atualizar UI imediatamente (optimistic)
  const newOrder = reorderArrayLocally(schedules, event.oldIndex, event.newIndex);
  setSchedules(newOrder);

  // 2. Enviar para backend
  try {
    const result = await fetch('/schedules/reorder-day', { ... });

    // 3. Confirmar com resposta do backend
    updateSchedulesWithNewOrder(result.updatedSchedules);

  } catch (error) {
    // 4. Reverter se falhou
    setSchedules(originalSchedules);
    showError('Falha ao reordenar');
  }
};
```

---

## 🧪 Testando a Integração

### Checklist de Testes

- [ ] **Exibição**: Schedules aparecem ordenados por `indexDay` no calendário
- [ ] **Arrastar para trás**: Item 3 → posição 1 (outros descem)
- [ ] **Arrastar para frente**: Item 1 → posição 3 (outros sobem)
- [ ] **Arrastar para mesma posição**: Nada muda mas não quebra
- [ ] **Erro de rede**: UI reverte para estado anterior
- [ ] **Schedule não encontrado**: Mostra mensagem de erro apropriada
- [ ] **Múltiplos dias**: Reordenar em um dia não afeta outros dias
- [ ] **Schedules sem indexDay**: Aparecem no final da lista (compatibilidade)

### Dados de Teste

Você pode criar schedules de teste com:

```bash
POST /schedules
{
  "date": "2025-12-10T10:00:00Z",
  "description": "Schedule Teste",
  "organizationId": "sua-org-id"
}
```

O backend automaticamente atribuirá `indexDay` sequencial.

---

## 🔗 Documentação Adicional

- **Entidade Schedule**: `src/models/schedule.entity.ts`
- **DTO de Reordenação**: `src/schedules/dto/reorder-schedules-day.dto.ts`
- **Service de Reordenação**: `src/schedules/services/reorder-schedules-day.service.ts`
- **Exemplos de API**: `docs/reorder-schedules-day-api.md`

---

## 💡 Resumo para IA/Equipe Frontend

1. **Use `indexDay`** para ordenação no calendário (não `index`)
2. **Posições são 1-based** (1, 2, 3...), não 0-based
3. **Backend recalcula tudo** - você só envia `date`, `movedItemId`, `newPosition`
4. **Sempre ordene** schedules por `indexDay` antes de renderizar
5. **Trate erros** e reverta UI se a requisição falhar
6. **Compatibilidade garantida** - campo `index` permanece intacto para outras apps

---

## 🆘 Dúvidas Comuns

**P: Por que não enviar todos os novos índices do frontend?**
R: Backend calcula automaticamente para evitar inconsistências e simplificar o frontend.

**P: O que acontece se mover um schedule para outro dia?**
R: Isso é feito via PUT `/schedules/:id` (endpoint diferente). O `indexDay` será recalculado automaticamente para o novo dia.

**P: E se dois usuários reordenarem ao mesmo tempo?**
R: A transação do banco garante que uma operação completa antes da outra. O último a salvar prevalece.

**P: Posso usar `index` no lugar de `indexDay`?**
R: NÃO. O `index` é usado por outras aplicações e deve permanecer inalterado. Use apenas `indexDay` para o calendário.

**P: Como migrar dados existentes?**
R: Backend tem script de migração em `migrations/add-index-day-field.sql`. Schedules antigos receberão `indexDay` automaticamente.
