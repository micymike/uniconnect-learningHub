-- Create study_partners table
CREATE TABLE IF NOT EXISTS study_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, partner_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_partners_user_id ON study_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_study_partners_partner_id ON study_partners(partner_id);

-- Enable RLS
ALTER TABLE study_partners ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own study partnerships" ON study_partners
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can create study partnerships" ON study_partners
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study partnerships" ON study_partners
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_study_partners_updated_at 
  BEFORE UPDATE ON study_partners 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();