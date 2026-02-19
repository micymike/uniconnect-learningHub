-- Create study_group_members table
CREATE TABLE IF NOT EXISTS study_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id, member_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_study_group_members_users ON study_group_members(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_member ON study_group_members(member_id);

-- Enable RLS
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_group_members
CREATE POLICY "Users can view group members they are part of" ON study_group_members
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id OR auth.uid() = member_id);

CREATE POLICY "Users can invite to groups they are part of" ON study_group_members
  FOR INSERT WITH CHECK (auth.uid() = invited_by AND (auth.uid() = user1_id OR auth.uid() = user2_id));

CREATE POLICY "Users can remove members they invited or themselves" ON study_group_members
  FOR DELETE USING (auth.uid() = invited_by OR auth.uid() = member_id);