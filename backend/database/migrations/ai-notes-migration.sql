-- Add columns to existing notes table for AI-generated content
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS transcription_text TEXT,
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'completed';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notes_ai_generated ON notes(is_ai_generated);
CREATE INDEX IF NOT EXISTS idx_notes_processing_status ON notes(processing_status);

-- Update existing AI-generated notes (if any)
UPDATE notes 
SET is_ai_generated = TRUE 
WHERE folder = 'AI Generated' OR 'ai-generated' = ANY(tags);