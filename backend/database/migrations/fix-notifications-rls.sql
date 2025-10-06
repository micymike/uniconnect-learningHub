-- Enable insert for authenticated users on notifications table

-- Make sure RLS is enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert for authenticated users (adjust as needed for your setup)
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON notifications;
CREATE POLICY "Allow insert for authenticated users"
  ON notifications
  FOR INSERT
  WITH CHECK (TRUE);

-- Optionally, allow select/update/delete as needed for your app
-- CREATE POLICY "Allow select for authenticated users"
--   ON notifications
--   FOR SELECT
--   USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
