-- Create math_solutions table for storing MathGPT solutions
CREATE TABLE IF NOT EXISTS math_solutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    problem TEXT NOT NULL,
    solution JSONB NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium',
    topic VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_math_solutions_user_id ON math_solutions(user_id);
CREATE INDEX IF NOT EXISTS idx_math_solutions_topic ON math_solutions(topic);
CREATE INDEX IF NOT EXISTS idx_math_solutions_difficulty ON math_solutions(difficulty);
CREATE INDEX IF NOT EXISTS idx_math_solutions_created_at ON math_solutions(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE math_solutions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own math solutions" ON math_solutions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own math solutions" ON math_solutions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own math solutions" ON math_solutions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own math solutions" ON math_solutions
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_math_solutions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_math_solutions_updated_at
    BEFORE UPDATE ON math_solutions
    FOR EACH ROW
    EXECUTE FUNCTION update_math_solutions_updated_at();