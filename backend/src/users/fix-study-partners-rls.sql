-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own study partnerships" ON study_partners;
DROP POLICY IF EXISTS "Users can create study partnerships" ON study_partners;
DROP POLICY IF EXISTS "Users can delete their own study partnerships" ON study_partners;

-- Create updated RLS policies
CREATE POLICY "Users can view their own study partnerships" ON study_partners
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can create study partnerships for themselves" ON study_partners
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study partnerships" ON study_partners
  FOR DELETE USING (auth.uid() = user_id);