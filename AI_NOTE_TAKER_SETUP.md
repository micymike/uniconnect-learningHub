# AI Note Taker Setup Guide

## Overview
The AI Note Taker feature allows students to record lectures and automatically generate structured notes using AI transcription and processing.

## Features
- **Real-time Audio Recording**: Record lectures with pause/resume functionality
- **AI Transcription**: Convert audio to text using OpenAI Whisper API
- **Smart Note Generation**: Transform transcriptions into structured, organized notes
- **Automatic Saving**: Generated notes are saved to the student's note collection
- **Mobile-Friendly**: Works on all devices with microphone access

## Setup Instructions

### 1. Backend Configuration

#### Environment Variables
Uses your existing Azure OpenAI configuration:
```env
AZURE_API_BASE=your_azure_endpoint
AZURE_API_KEY=your_azure_api_key
AZURE_API_MODEL=your_deployment_name
AZURE_API_VERSION=your_api_version
```

#### Dependencies
No additional dependencies needed - uses existing Azure setup.

#### Database Migration
Run the AI notes migration:
```sql
-- Execute the migration in your Supabase SQL editor
-- File: backend/database/migrations/ai-notes-migration.sql
```

### 2. Frontend Integration
The AI Note Taker is automatically integrated into the student dashboard sidebar.

### 3. API Endpoints

#### POST /notes/transcribe
- **Purpose**: Upload audio file for transcription and note generation
- **Body**: FormData with `audio` file and `noteName`
- **Response**: Generated notes with transcription
- **File Limit**: 25MB (suitable for long lectures)

## Usage Flow

1. **Start Recording**: Student clicks "Start Recording" button
2. **Record Lecture**: Audio is captured in real-time with timer
3. **Pause/Resume**: Optional pause functionality during recording
4. **Stop & Process**: Stop recording and click "Generate Notes"
5. **AI Processing**: 
   - Audio transcribed using Whisper API
   - Raw transcription processed by GPT-3.5 for structure
   - Notes formatted with headings, bullet points, key concepts
6. **Auto-Save**: Generated notes saved to student's collection
7. **View Results**: Both structured notes and raw transcription available

## Technical Implementation

### Backend Services
- **TranscriptionService**: Handles OpenAI API integration
- **NotesService**: Extended with `transcribeAndSaveNote` method
- **NotesController**: New `/transcribe` endpoint

### Frontend Components
- **AINoteTaker.tsx**: Main recording interface
- **MediaRecorder API**: Browser-native audio recording
- **Real-time Timer**: Visual feedback during recording
- **Processing States**: Loading indicators and error handling

### Audio Processing
- **Format**: WebM audio format for browser compatibility
- **Quality**: Optimized for speech recognition
- **Size Limits**: 25MB maximum file size
- **Compression**: Automatic compression for efficient upload

## Best Practices

### For Students
- Use in quiet environments for better transcription accuracy
- Speak clearly and at moderate pace
- Use descriptive note names for organization
- Keep recordings under 25MB for optimal performance

### For Developers
- Monitor OpenAI API usage and costs
- Implement rate limiting for API calls
- Add error handling for network issues
- Consider caching for repeated requests

## Security & Privacy
- Audio files are processed and not permanently stored
- Only transcription and generated notes are saved
- All data encrypted in transit and at rest
- User authentication required for all operations

## Cost Considerations
- Azure OpenAI Whisper: Based on your Azure pricing tier
- Azure OpenAI Chat: Based on your existing deployment
- Uses your current Azure OpenAI quota and pricing

## Troubleshooting

### Common Issues
1. **Microphone Access Denied**: Check browser permissions
2. **Large File Upload**: Ensure file size under 25MB
3. **API Errors**: Verify OpenAI API key and credits
4. **Poor Transcription**: Check audio quality and background noise

### Error Messages
- "Failed to access microphone": Browser permission issue
- "File too large": Reduce recording length or quality
- "Transcription failed": OpenAI API issue or invalid audio format
- "Processing timeout": Large file or API rate limits

## Future Enhancements
- Multiple language support
- Speaker identification
- Real-time transcription
- Integration with course materials
- Collaborative note sharing
- Export to various formats (PDF, Word, etc.)

## Support
For technical issues or feature requests, contact the development team or create an issue in the project repository.