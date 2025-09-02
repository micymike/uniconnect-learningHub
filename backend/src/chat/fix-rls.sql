-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all user statuses" ON user_status;
DROP POLICY IF EXISTS "Users can update their own status" ON user_status;
DROP POLICY IF EXISTS "Users can insert their own status" ON user_status;
DROP POLICY IF EXISTS "Users can upsert their own status" ON user_status;

-- Create new simplified policies
CREATE POLICY "Enable all for authenticated users" ON user_status
    FOR ALL USING (auth.role() = 'authenticated');

-- Ensure RLS is enabled
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;