# API de Reordenação de Schedules por Dia

## Endpoint

```
PUT /schedules/reorder-day
```

## Como o Frontend Deve Enviar os Dados

### Payload

```json
{
  "date": "2025-12-10",
  "movedItemId": "550e8400-e29b-41d4-a716-446655440000",
  "newPosition": 1
}
```

### Campos

- **`date`** (string, obrigatório): Data no formato `YYYY-MM-DD` dos schedules que serão reordenados
- **`movedItemId`** (string, obrigatório): UUID do schedule que foi arrastado/movido
- **`newPosition`** (number, obrigatório): Nova posição desejada (1 = primeira posição, 2 = segunda, etc.)

---

## Exemplo de Uso no Frontend

### Cenário: Usuário arrasta item da posição 3 para posição 1

**Estado inicial no calendário (dia 10/12/2025):**

```
Posição 1: Schedule A (id: aaa-111) ← indexDay: 1
Posição 2: Schedule B (id: bbb-222) ← indexDay: 2
Posição 3: Schedule C (id: ccc-333) ← indexDay: 3
Posição 4: Schedule D (id: ddd-444) ← indexDay: 4
```

**Usuário arrasta Schedule C para o topo (posição 1)**

**Request do frontend:**

```typescript
await fetch("/schedules/reorder-day", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    date: "2025-12-10",
    movedItemId: "ccc-333", // ID do Schedule C
    newPosition: 1, // Nova posição (topo)
  }),
});
```

**Response do backend:**

```json
{
  "message": "Schedule reordered successfully for the day",
  "updatedSchedules": [
    { "id": "ccc-333", "indexDay": 1 },
    { "id": "aaa-111", "indexDay": 2 },
    { "id": "bbb-222", "indexDay": 3 },
    { "id": "ddd-444", "indexDay": 4 }
  ]
}
```

**Novo estado no calendário:**

```
Posição 1: Schedule C (id: ccc-333) ← indexDay: 1 ✅
Posição 2: Schedule A (id: aaa-111) ← indexDay: 2
Posição 3: Schedule B (id: bbb-222) ← indexDay: 3
Posição 4: Schedule D (id: ddd-444) ← indexDay: 4
```

---

## Exemplos de Implementação no Frontend

### React com drag-and-drop (react-beautiful-dnd)

```typescript
const handleDragEnd = async (result: DropResult) => {
  if (!result.destination) return;

  const movedItemId = result.draggableId;
  const newPosition = result.destination.index + 1; // +1 porque a API usa 1-based
  const date = getCurrentDate(); // função que retorna data atual no formato YYYY-MM-DD

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

    const data = await response.json();

    // Atualizar estado local com a nova ordem retornada pelo backend
    updateSchedulesOrder(data.updatedSchedules);
  } catch (error) {
    console.error("Erro ao reordenar:", error);
    // Reverter UI para estado anterior
  }
};
```

### Vue com draggable

```typescript
const onDragEnd = async (event: any) => {
  const movedItemId = schedules.value[event.oldIndex].id;
  const newPosition = event.newIndex + 1; // +1 para 1-based index

  try {
    const { data } = await axios.put("/schedules/reorder-day", {
      date: selectedDate.value,
      movedItemId,
      newPosition,
    });

    // Backend já retorna a ordem correta, só atualizar UI
    schedules.value = schedules.value.map((schedule) => {
      const updated = data.updatedSchedules.find((u) => u.id === schedule.id);
      return updated ? { ...schedule, indexDay: updated.indexDay } : schedule;
    });
  } catch (error) {
    // Tratar erro
  }
};
```

### Angular

```typescript
async onDrop(event: CdkDragDrop<Schedule[]>) {
  const movedItemId = this.schedules[event.previousIndex].id;
  const newPosition = event.currentIndex + 1;

  try {
    const response = await this.http.put<ReorderResponse>(
      '/schedules/reorder-day',
      {
        date: this.selectedDate,
        movedItemId,
        newPosition
      }
    ).toPromise();

    // Atualizar schedules com nova ordem
    this.schedules = this.schedules.map(schedule => ({
      ...schedule,
      indexDay: response.updatedSchedules.find(u => u.id === schedule.id)?.indexDay
    }));

  } catch (error) {
    // Reverter
  }
}
```

---

## Validações do Backend

O backend faz as seguintes validações:

1. ✅ **Data válida**: Formato YYYY-MM-DD
2. ✅ **Schedule existe**: O `movedItemId` deve existir naquele dia
3. ✅ **Posição válida**: `newPosition` deve estar entre 1 e o total de schedules daquele dia
4. ✅ **Transação atômica**: Se algo falhar, nada é alterado

### Erros Possíveis

```typescript
// Schedule não encontrado
{
  "statusCode": 404,
  "message": "Schedule with id xxx not found on date 2025-12-10"
}

// Posição inválida
{
  "statusCode": 400,
  "message": "Invalid position 10. Must be between 1 and 4"
}

// Nenhum schedule naquele dia
{
  "statusCode": 404,
  "message": "No schedules found for date 2025-12-10"
}
```

---

## Vantagens desta Abordagem

✅ **Backend é fonte única de verdade**: Impossível ter inconsistências  
✅ **Menos dados na rede**: Frontend envia apenas 3 campos  
✅ **Frontend mais simples**: Não precisa calcular todos os novos índices  
✅ **Segurança**: Backend valida tudo e garante integridade  
✅ **Transação atômica**: Ou tudo funciona ou nada muda

---

## Notas Importantes

- 📌 **Posições são 1-based**: Primeira posição = 1, segunda = 2, etc.
- 📌 **Backend recalcula TODOS os índices**: Você só informa qual item moveu e para onde
- 📌 **Organização é preservada**: Items que não foram movidos mantêm sua ordem relativa
- 📌 **Response retorna nova ordem**: Use `updatedSchedules` para atualizar sua UI
- 📌 **Compatível com outras aplicações**: Campo `index` global continua intacto
