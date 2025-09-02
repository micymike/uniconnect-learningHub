-- Create shared_notes table
CREATE TABLE IF NOT EXISTS shared_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shared_notes_users ON shared_notes(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_shared_notes_created_by ON shared_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_study_sessions_users ON study_sessions(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_start_time ON study_sessions(start_time);

-- Enable RLS
ALTER TABLE shared_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for shared_notes
CREATE POLICY "Users can view shared notes they are part of" ON shared_notes
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create shared notes" ON shared_notes
  FOR INSERT WITH CHECK (auth.uid() = created_by AND (auth.uid() = user1_id OR auth.uid() = user2_id));

CREATE POLICY "Users can update their own shared notes" ON shared_notes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own shared notes" ON shared_notes
  FOR DELETE USING (auth.uid() = created_by);

-- RLS policies for study_sessions
CREATE POLICY "Users can view study sessions they are part of" ON study_sessions
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create study sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = created_by AND (auth.uid() = user1_id OR auth.uid() = user2_id));

CREATE POLICY "Users can update study sessions they are part of" ON study_sessions
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can delete their own study sessions" ON study_sessions
  FOR DELETE USING (auth.uid() = created_by);

-- Create triggers for updated_at
CREATE TRIGGER update_shared_notes_updated_at 
  BEFORE UPDATE ON shared_notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_sessions_updated_at 
  BEFORE UPDATE ON study_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();