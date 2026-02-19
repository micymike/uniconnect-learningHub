-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Mates Table
CREATE TABLE IF NOT EXISTS study_mates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    study_mate_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, study_mate_id)
);

-- User Status Table
CREATE TABLE IF NOT EXISTS user_status (
    user_id UUID PRIMARY KEY,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    is_typing BOOLEAN DEFAULT FALSE,
    typing_to UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_receiver ON chat_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_study_mates_user_id ON study_mates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_status_online ON user_status(is_online);

-- RLS Policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_mates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Chat messages policies
CREATE POLICY "Users can view their own messages" ON chat_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON chat_messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Study mates policies
CREATE POLICY "Users can view their study mates" ON study_mates
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = study_mate_id);

CREATE POLICY "Users can add study mates" ON study_mates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their study mate requests" ON study_mates
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = study_mate_id);

-- User status policies
CREATE POLICY "Users can view all user statuses" ON user_status
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own status" ON user_status
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own status" ON user_status
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own status" ON user_status
    FOR ALL USING (auth.uid() = user_id);