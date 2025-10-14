-- Update courses table to support professional e-learning platform features
-- Run this migration to add new columns to the existing courses table

-- Add new columns to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other',
ADD COLUMN IF NOT EXISTS difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS duration_hours DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_free BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS intro_video_url TEXT,
ADD COLUMN IF NOT EXISTS video_content_url TEXT,
ADD COLUMN IF NOT EXISTS prerequisites TEXT,
ADD COLUMN IF NOT EXISTS learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Update existing courses to have valid data
UPDATE courses 
SET 
  category = COALESCE(category, 'other'),
  difficulty_level = COALESCE(difficulty_level, 'beginner'),
  duration_hours = COALESCE(duration_hours, 0),
  price = COALESCE(price, 0),
  is_free = COALESCE(is_free, true),
  learning_objectives = COALESCE(learning_objectives, '[]'::jsonb),
  tags = COALESCE(tags, '[]'::jsonb),
  status = COALESCE(status, 'draft'),
  is_featured = COALESCE(is_featured, false)
WHERE category IS NULL OR difficulty_level IS NULL OR duration_hours IS NULL 
   OR price IS NULL OR is_free IS NULL OR learning_objectives IS NULL 
   OR tags IS NULL OR status IS NULL OR is_featured IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON courses(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_is_free ON courses(is_free);
CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON courses(is_featured);
CREATE INDEX IF NOT EXISTS idx_courses_tags ON courses USING GIN(tags);

-- Add RLS policies if they don't exist
DO $$
BEGIN
  -- Allow authenticated users to read published courses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' AND policyname = 'Users can view published courses'
  ) THEN
    CREATE POLICY "Users can view published courses" ON courses
      FOR SELECT USING (status = 'published' OR created_by = auth.uid());
  END IF;

  -- Allow admins to manage all courses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courses' AND policyname = 'Admins can manage courses'
  ) THEN
    CREATE POLICY "Admins can manage courses" ON courses
      FOR ALL USING (
        auth.jwt() ->> 'email' = 'mosesmichael878@gmail.com'
      );
  END IF;
END $$;