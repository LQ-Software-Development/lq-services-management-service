# Script de Migração: Adicionar e popular campo indexDay

## Descrição

Este script adiciona o campo `indexDay` à tabela `schedule` e popula com valores sequenciais agrupados por `organizationId` e data (dia).

## Quando executar

Execute este script **depois** que o TypeORM sincronizar o schema (adicionar a coluna `indexDay`).

## Como executar

### Opção 1: Via psql (linha de comando)

```bash
psql -U <usuario> -d <database> -f migrations/add-index-day-field.sql
```

### Opção 2: Via cliente PostgreSQL (DBeaver, pgAdmin, etc.)

1. Abra o arquivo `add-index-day-field.sql`
2. Execute o script no seu cliente SQL

### Opção 3: Via Node.js script

```bash
node migrations/run-migration.js
```

## O que o script faz

1. **Adiciona coluna** (opcional, pois TypeORM já pode ter feito isso):

   - Adiciona coluna `indexDay` tipo `integer` nullable

2. **Popula valores**:

   - Agrupa schedules por `organizationId` e `DATE(date)`
   - Atribui números sequenciais (1, 2, 3...) dentro de cada grupo
   - Ordenação: preserva `indexDay` existente, depois `index`, depois `createdAt`
   - Ignora registros soft-deleted (`deletedAt IS NOT NULL`)

3. **Consulta de verificação** (comentada):
   - Descomente para ver a distribuição de schedules por data

## Resultado esperado

Antes da migração:

```
id  | organizationId | date       | index | indexDay
----|----------------|------------|-------|----------
1   | org-a          | 2025-12-10 | 1     | NULL
2   | org-a          | 2025-12-10 | 2     | NULL
3   | org-a          | 2025-12-11 | 3     | NULL
4   | org-a          | 2025-12-11 | 4     | NULL
```

Depois da migração:

```
id  | organizationId | date       | index | indexDay
----|----------------|------------|-------|----------
1   | org-a          | 2025-12-10 | 1     | 1
2   | org-a          | 2025-12-10 | 2     | 2
3   | org-a          | 2025-12-11 | 3     | 1
4   | org-a          | 2025-12-11 | 4     | 2
```

## Rollback

Se precisar reverter:

```sql
UPDATE schedule SET "indexDay" = NULL;
-- Ou para remover a coluna completamente:
-- ALTER TABLE schedule DROP COLUMN IF EXISTS "indexDay";
```

## Notas importantes

- ✅ Seguro para executar múltiplas vezes (idempotente)
- ✅ Não afeta dados existentes além de adicionar/atualizar `indexDay`
- ✅ Ignora schedules soft-deleted
- ✅ Preserva ordenação existente quando possível
- ⚠️ Execute em horário de baixo tráfego para bancos grandes
- ⚠️ Faça backup antes de executar em produção
