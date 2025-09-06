-- Migration: Create study_partner_requests table

CREATE TABLE IF NOT EXISTS study_partner_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (requester_id, recipient_id, status)
);
