# AI Features Documentation

## Overview
This document outlines all AI-powered features available in the UniConnect Learning Hub platform, designed to make student life easier and more productive.

## 🎯 Core AI Features (Fully Implemented)

### 1. Personalized Study Assistant
**Endpoint:** `POST /ai/ask`
**Description:** AI that answers questions about course material, explains difficult concepts, and provides step-by-step solutions.

**Request Body:**
```json
{
  "studentId": "string",
  "question": "string",
  "courseId": "string (optional)",
  "lessonId": "string (optional)",
  "sectionId": "string (optional)"
}
```

**Features:**
- Context-aware responses using course/lesson/section information
- Maintains conversation history for continuity
- Personalized explanations based on student preferences

### 2. Smart Flashcard Generation
**Endpoint:** `POST /ai/flashcards`
**Description:** Automatic creation of flashcards from notes, lectures, or past questions, tailored to weak areas.

**Request Body:**
```json
{
  "studentId": "string",
  "notes": "string (optional)",
  "lecture": "string (optional)",
  "pastQuestions": "string (optional)",
  "focusArea": "string (optional)"
}
```

**Features:**
- Multiple input sources (notes, lectures, past questions)
- Tailored to student's weak areas and preferences
- Intelligent Q&A pair generation

### 3. Adaptive Quiz Generator
**Endpoint:** `POST /ai/quiz`
**Description:** AI-generated quizzes that adapt in difficulty and topic based on performance and learning progress.

**Request Body:**
```json
{
  "studentId": "string",
  "courseId": "string (optional)",
  "lessonId": "string (optional)",
  "focusArea": "string (optional)",
  "difficulty": "string (optional)"
}
```

**Features:**
- Adaptive difficulty based on student performance
- Multiple-choice questions with detailed explanations
- Progress-based topic selection

### 4. Progress Tracking & Recommendations
**Endpoint:** `GET /ai/progress?studentId=string`
**Description:** Insights into strengths/weaknesses with personalized study plans and resource recommendations.

**Features:**
- Analyzes conversation history and performance patterns
- Identifies learning strengths and weaknesses
- Provides personalized study recommendations

### 5. Essay/Assignment Feedback
**Endpoint:** `POST /ai/feedback`
**Description:** Instant feedback on written assignments, including grammar, structure, and content suggestions.

**Request Body:**
```json
{
  "studentId": "string",
  "text": "string",
  "assignmentType": "string (optional)"
}
```

**Features:**
- Grammar and structure analysis
- Content improvement suggestions
- Assignment-type specific feedback

### 6. Summarization Tools
**Endpoint:** `POST /ai/summarize`
**Description:** AI that summarizes long articles, lectures, or videos into concise notes or key points.

**Request Body:**
```json
{
  "studentId": "string",
  "text": "string",
  "type": "string (optional)" // 'article', 'lecture', 'video'
}
```

**Features:**
- Content-type specific summarization
- Key point extraction
- Concise note generation

### 7. Time Management Coach
**Endpoint:** `POST /ai/time-management`
**Description:** Study schedule suggestions, reminders, and productivity tips based on habits and deadlines.

**Request Body:**
```json
{
  "studentId": "string",
  "habits": "string (optional)",
  "deadlines": "string (optional)",
  "goals": "string (optional)"
}
```

**Features:**
- Personalized study schedules
- Productivity tips and strategies
- Deadline-aware planning

### 8. Collaboration Helper
**Endpoint:** `POST /ai/collaboration`
**Description:** AI that helps form study groups, suggests peers to connect with, or facilitates group discussions.

**Request Body:**
```json
{
  "studentId": "string",
  "courseId": "string (optional)",
  "interests": "string (optional)",
  "goals": "string (optional)"
}
```

**Features:**
- Study group formation suggestions
- Peer matching based on interests and goals
- Group discussion facilitation

### 9. Mental Health & Motivation
**Endpoint:** `POST /ai/motivation`
**Description:** Encouragement, stress management tips, and check-ins to support well-being during studies.

**Request Body:**
```json
{
  "studentId": "string",
  "mood": "string (optional)",
  "context": "string (optional)"
}
```

**Features:**
- Mood-based support and encouragement
- Stress management techniques
- Well-being check-ins and tips

## 🚀 Enhanced Multimodal Support (Newly Implemented)

### 10. Advanced Multimodal Support
**Endpoint:** `POST /ai/ask-multimodal`
**Description:** Ability to ask questions using text, voice, or images with OCR, ASR, and math recognition.

**Request Body:**
```json
{
  "studentId": "string",
  "question": "string (optional)",
  "imageBase64": "string (optional)",
  "audioBase64": "string (optional)"
}
```

**New Features:**
- **OCR (Optical Character Recognition):** Extract text from handwritten notes and textbooks
- **Math Equation Recognition:** Identify and solve mathematical equations step-by-step
- **Diagram Analysis:** Analyze charts, graphs, and diagrams
- **Speech-to-Text:** Convert audio questions to text
- **Text-to-Speech:** Generate audio responses
- **Visual Content Analysis:** Describe and analyze image content

**Response:**
```json
{
  "answer": "string",
  "audioResponse": "string (base64 audio)"
}
```

## 🎓 New Student Life Features

### 11. Smart Calendar Integration & Study Scheduling
**Endpoint:** `POST /ai/study-schedule`
**Description:** Intelligent study schedule generation based on courses, assignments, exams, and personal preferences.

**Request Body:**
```json
{
  "studentId": "string",
  "courses": [
    {
      "id": "string",
      "name": "string",
      "credits": "number",
      "difficulty": "string"
    }
  ],
  "assignments": [
    {
      "id": "string",
      "name": "string",
      "dueDate": "string",
      "estimatedHours": "number",
      "priority": "string"
    }
  ],
  "exams": [
    {
      "id": "string",
      "name": "string",
      "date": "string",
      "weight": "number"
    }
  ],
  "preferences": {
    "studyHoursPerDay": "number (optional)",
    "preferredStudyTimes": ["string"] (optional)",
    "breakDuration": "number (optional)",
    "weekendStudy": "boolean (optional)"
  }
}
```

**Features:**
- Optimal study schedule generation
- Assignment deadline management
- Exam preparation planning
- Spaced repetition integration
- Personal preference consideration

### 12. Expense Tracking for Student Budgets
**Endpoint:** `POST /ai/track-expenses`
**Description:** Smart expense tracking with budget analysis and money-saving recommendations.

**Request Body:**
```json
{
  "studentId": "string",
  "expenses": [
    {
      "category": "textbooks|supplies|food|transport|entertainment|other",
      "amount": "number",
      "description": "string",
      "date": "string"
    }
  ],
  "monthlyBudget": "number (optional)"
}
```

**Features:**
- Category-wise expense breakdown
- Budget status monitoring
- Money-saving recommendations
- Student-specific financial advice

### 13. Grade Prediction and GPA Calculator
**Endpoint:** `POST /ai/predict-grades`
**Description:** Predict final grades and calculate GPA with improvement suggestions.

**Request Body:**
```json
{
  "studentId": "string",
  "courses": [
    {
      "id": "string",
      "name": "string",
      "currentGrade": "number",
      "assignments": [
        {
          "name": "string",
          "grade": "number",
          "weight": "number",
          "completed": "boolean"
        }
      ],
      "exams": [
        {
          "name": "string",
          "grade": "number (optional)",
          "weight": "number",
          "date": "string"
        }
      ],
      "participation": "number",
      "attendance": "number"
    }
  ]
}
```

**Features:**
- Final grade predictions with confidence levels
- GPA calculation and forecasting
- Course-specific improvement tips
- Performance trend analysis

### 14. Research Assistant for Citations and Sources
**Endpoint:** `POST /ai/research-assistant`
**Description:** Comprehensive research assistance with citation generation and source recommendations.

**Request Body:**
```json
{
  "studentId": "string",
  "topic": "string",
  "assignmentType": "essay|research_paper|presentation|thesis",
  "requirements": {
    "minSources": "number (optional)",
    "citationStyle": "APA|MLA|Chicago|Harvard (optional)",
    "academicLevel": "undergraduate|graduate|doctoral (optional)",
    "pageLength": "number (optional)"
  }
}
```

**Features:**
- Detailed research outlines
- Academic source recommendations
- Proper citation formatting
- Writing tips and strategies
- Project timeline planning

### 15. Lecture Note Organizer and Enhancer
**Endpoint:** `POST /ai/enhance-notes`
**Description:** Transform raw lecture notes into organized, enhanced study materials.

**Request Body:**
```json
{
  "studentId": "string",
  "rawNotes": "string",
  "courseInfo": {
    "name": "string",
    "topic": "string",
    "date": "string",
    "professor": "string (optional)"
  }
}
```

**Features:**
- Note organization and enhancement
- Key point extraction
- Definition identification
- Example generation
- Study question creation
- Automatic flashcard generation

### 16. Study Group Matcher and Organizer
**Endpoint:** `POST /ai/find-study-partners`
**Description:** Find compatible study partners and organize effective study groups.

**Request Body:**
```json
{
  "studentId": "string",
  "preferences": {
    "courses": ["string"],
    "studyStyle": "visual|auditory|kinesthetic|mixed",
    "availability": ["string"],
    "location": "online|campus|library|flexible",
    "groupSize": "small|medium|large"
  }
}
```

**Features:**
- Compatible partner matching
- Study group formation
- Meeting scheduling assistance
- Collaboration strategies

## 🔧 Technical Implementation

### Dependencies
- **Tesseract.js:** OCR functionality
- **Google Cloud Speech-to-Text:** Audio transcription
- **Google Cloud Text-to-Speech:** Audio response generation
- **Azure Computer Vision:** Image analysis
- **Azure OpenAI:** Core AI processing

### Environment Variables Required
```env
# Azure OpenAI
AZURE_API_BASE=your_azure_openai_endpoint
AZURE_API_KEY=your_azure_openai_key

# Azure Computer Vision
AZURE_COMPUTER_VISION_ENDPOINT=your_computer_vision_endpoint
AZURE_COMPUTER_VISION_KEY=your_computer_vision_key

# Google Cloud (for Speech services)
GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account_json
```

### Database Schema
The system uses Supabase with the `student_ai_context` table:
```sql
CREATE TABLE student_ai_context (
  student_id TEXT PRIMARY KEY,
  conversation_history TEXT[],
  flashcard_preferences TEXT[],
  personalization JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📊 Feature Status Summary

| Feature | Status | Endpoints | Key Capabilities |
|---------|--------|-----------|------------------|
| Personalized Study Assistant | ✅ Complete | `/ai/ask` | Q&A, explanations, context-aware |
| Smart Flashcard Generation | ✅ Complete | `/ai/flashcards` | Multi-source, personalized |
| Adaptive Quiz Generator | ✅ Complete | `/ai/quiz` | Difficulty adaptation, progress-based |
| Progress Tracking | ✅ Complete | `/ai/progress` | Strengths/weaknesses analysis |
| Essay Feedback | ✅ Complete | `/ai/feedback` | Grammar, structure, content |
| Summarization Tools | ✅ Complete | `/ai/summarize` | Multi-format summarization |
| Time Management Coach | ✅ Complete | `/ai/time-management` | Schedule optimization |
| Collaboration Helper | ✅ Complete | `/ai/collaboration` | Group formation, peer matching |
| Mental Health Support | ✅ Complete | `/ai/motivation` | Mood support, stress management |
| **Enhanced Multimodal Support** | ✅ **New** | `/ai/ask-multimodal` | OCR, ASR, math recognition |
| **Smart Study Scheduling** | ✅ **New** | `/ai/study-schedule` | Calendar integration, optimization |
| **Expense Tracking** | ✅ **New** | `/ai/track-expenses` | Budget analysis, recommendations |
| **Grade Prediction** | ✅ **New** | `/ai/predict-grades` | GPA calculation, improvement tips |
| **Research Assistant** | ✅ **New** | `/ai/research-assistant` | Citations, sources, outlines |
| **Note Enhancement** | ✅ **New** | `/ai/enhance-notes` | Organization, key points, flashcards |
| **Study Group Matching** | ✅ **New** | `/ai/find-study-partners` | Partner matching, group organization |

## 🎯 Benefits for Students

### Academic Performance
- **Improved Understanding:** Step-by-step explanations and personalized tutoring
- **Better Retention:** Spaced repetition and adaptive learning
- **Efficient Study:** Optimized schedules and focused materials
- **Grade Improvement:** Predictive analytics and targeted recommendations

### Time Management
- **Smart Scheduling:** AI-optimized study plans
- **Deadline Management:** Automatic prioritization and reminders
- **Productivity Tips:** Personalized efficiency strategies

### Financial Management
- **Budget Tracking:** Expense categorization and analysis
- **Money-saving Tips:** Student-specific financial advice
- **Cost Optimization:** Smart spending recommendations

### Research & Writing
- **Research Assistance:** Source finding and citation formatting
- **Writing Support:** Grammar, structure, and content feedback
- **Note Organization:** Enhanced lecture notes and study materials

### Social Learning
- **Study Groups:** Compatible partner matching
- **Collaboration:** Group formation and management
- **Peer Learning:** Shared knowledge and experiences

### Well-being Support
- **Mental Health:** Stress management and motivation
- **Work-life Balance:** Healthy study habits and breaks
- **Progress Tracking:** Achievement recognition and goal setting

This comprehensive AI system transforms the traditional learning experience into an intelligent, personalized, and efficient educational journey.