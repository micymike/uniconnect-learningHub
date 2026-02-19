-- Migration: Add id column (UUID primary key) to notes table

-- 1. Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add id column with default UUID, nullable for now to allow update
ALTER TABLE public.notes
ADD COLUMN IF NOT EXISTS id uuid NULL;

-- 3. Set id for existing rows that are null
UPDATE public.notes
SET id = uuid_generate_v4()
WHERE id IS NULL;

-- 4. Alter column to set NOT NULL and default for new rows
ALTER TABLE public.notes
ALTER COLUMN id SET NOT NULL,
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 5. Set id as primary key (if not already)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'notes'
      AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE public.notes
    ADD PRIMARY KEY (id);
  END IF;
END$$;
