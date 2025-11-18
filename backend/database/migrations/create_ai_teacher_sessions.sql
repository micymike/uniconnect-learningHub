-- Create AI Teacher Sessions table
CREATE TABLE IF NOT EXISTS ai_teacher_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic TEXT,
    pdf_content TEXT,
    conversation_history JSONB DEFAULT '[]'::jsonb,
    blackboard_content JSONB DEFAULT '[]'::jsonb,
    notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_teacher_sessions_user_id ON ai_teacher_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_teacher_sessions_created_at ON ai_teacher_sessions(created_at);

-- Enable RLS
ALTER TABLE ai_teacher_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own sessions
CREATE POLICY "Users can access their own AI teacher sessions" ON ai_teacher_sessions
    FOR ALL USING (auth.uid() = user_id);