-- Migration: Create flashcard_scores table

CREATE TABLE IF NOT EXISTS flashcard_scores (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL,
  bonus INTEGER DEFAULT 0,
  num_questions INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
