-- Migration Script: Add and populate indexDay field for schedules
-- This script adds the indexDay column and populates it with sequential numbers
-- grouped by organizationId and date (day)

-- Step 1: Add the indexDay column (if not already added by TypeORM sync)
-- ALTER TABLE schedule ADD COLUMN IF NOT EXISTS "indexDay" integer;

-- Step 2: Populate indexDay with sequential numbers per day
-- This uses ROW_NUMBER() to assign sequential numbers to schedules
-- grouped by organizationId and date (truncated to day)
WITH ranked_schedules AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "organizationId", DATE("date") 
      ORDER BY 
        COALESCE("indexDay", 999999),  -- Preserve existing indexDay if any
        "index",                        -- Then by global index
        "createdAt",                    -- Then by creation time
        id                              -- Finally by ID for consistency
    ) as new_index_day
  FROM schedule
  WHERE "deletedAt" IS NULL
)
UPDATE schedule
SET "indexDay" = ranked_schedules.new_index_day
FROM ranked_schedules
WHERE schedule.id = ranked_schedules.id;

-- Step 3: Verify the results
-- Uncomment to see the distribution of schedules by date
/*
SELECT 
  "organizationId",
  DATE("date") as schedule_date,
  COUNT(*) as total_schedules,
  MIN("indexDay") as min_index,
  MAX("indexDay") as max_index
FROM schedule
WHERE "deletedAt" IS NULL
GROUP BY "organizationId", DATE("date")
ORDER BY "organizationId", schedule_date
LIMIT 50;
*/
