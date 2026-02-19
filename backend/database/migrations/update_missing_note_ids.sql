-- Script to assign UUIDs to all notes missing an id

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assign UUIDs to notes missing an id
UPDATE public.notes
SET id = uuid_generate_v4()
WHERE id IS NULL;
