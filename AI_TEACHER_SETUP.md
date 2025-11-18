# AI Teacher Feature Setup

## Overview
The AI Teacher feature provides an interactive learning experience with:
- **AI Avatar**: Friendly teacher avatar with visual states (speaking, listening, idle)
- **Blackboard**: Dynamic content updates based on the lesson
- **Voice Interaction**: Speech recognition and text-to-speech
- **Note Taking**: Smart note suggestions and saving
- **PDF Support**: Upload PDFs for AI to teach from

## Features

### 🤖 AI Avatar
- Uses DiceBear API for free avatar generation
- Visual states: idle, speaking, listening
- Animated indicators for current state

### 📋 Blackboard
- Dynamic content updates during teaching
- Formatted code/text display
- Visual learning aids

### 🎤 Voice Interaction
- Speech recognition for student input
- Text-to-speech for AI responses
- "I'm all ears" interruption handling

### 📝 Smart Notes
- AI suggests key points to note down
- Save notes to database
- Session history tracking

### 📄 PDF Upload
- Upload PDFs for AI to teach from
- Content extraction and analysis
- Topic-based or document-based teaching

## Setup Instructions

### 1. Database Migration
Run this SQL in your Supabase SQL editor:

```sql
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
```

### 2. Backend Dependencies
The following dependencies are already installed:
- `pdf-parse` - For PDF content extraction
- `@supabase/supabase-js` - Database operations
- `axios` - API calls to Azure OpenAI

### 3. Environment Variables
Ensure these are set in your backend `.env`:
```
AZURE_API_BASE=your_azure_openai_endpoint
AZURE_API_KEY=your_azure_openai_key
AZURE_API_MODEL=your_deployment_name
AZURE_API_VERSION=2024-02-15-preview
```

### 4. Frontend Features
- Responsive design for mobile and desktop
- Voice recognition (Chrome/Edge browsers)
- Text-to-speech synthesis
- File upload handling
- Real-time conversation updates

## API Endpoints

### POST /api/ai/teacher/start
Start a new teaching session
- Body: `{ topic?: string }` + optional PDF file
- Returns: `{ sessionId, introduction, blackboardContent }`

### POST /api/ai/teacher/continue
Continue conversation
- Body: `{ sessionId, message, isInterruption? }`
- Returns: `{ response, blackboardUpdate?, suggestedNotes? }`

### POST /api/ai/teacher/notes
Save student notes
- Body: `{ sessionId, notes }`
- Returns: `{ success: boolean }`

### GET /api/ai/teacher/session/:id
Get session history
- Returns: `{ conversation, blackboard, notes, topic }`

## Usage

1. **Start Session**: Enter a topic or upload a PDF
2. **Interactive Learning**: Ask questions, get explanations
3. **Voice Input**: Use microphone for hands-free interaction
4. **Take Notes**: AI suggests key points to remember
5. **Review**: Check conversation history and saved notes

## Browser Compatibility

- **Voice Recognition**: Chrome, Edge, Safari (latest versions)
- **Text-to-Speech**: All modern browsers
- **File Upload**: All modern browsers
- **Responsive Design**: Mobile and desktop optimized

## Free APIs Used

- **DiceBear**: Free avatar generation
- **Web Speech API**: Built-in browser speech recognition
- **Speech Synthesis API**: Built-in browser text-to-speech

No additional API keys needed for avatar or voice features!