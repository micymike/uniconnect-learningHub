# 🤖 AI Features for UniConnect Learning Hub

## Overview

This directory contains a comprehensive AI-powered learning assistant system designed to make student life easier and more productive. The system includes 16 fully implemented features that cover every aspect of student academic and personal life.

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Set up your environment variables in .env
```

### 2. Database Setup
```bash
# Run the database setup script in your Supabase SQL editor
# File: src/ai/database-setup.sql
```

### 3. Start the Server
```bash
npm run start:dev
```

## 📋 Feature Status

| Feature | Status | Description |
|---------|--------|-------------|
| ✅ Personalized Study Assistant | Complete | AI Q&A with context awareness |
| ✅ Smart Flashcard Generation | Complete | Auto-generated flashcards from multiple sources |
| ✅ Adaptive Quiz Generator | Complete | Difficulty-adaptive quizzes |
| ✅ Progress Tracking | Complete | Learning analytics and recommendations |
| ✅ Essay Feedback | Complete | Writing assistance and grammar checking |
| ✅ Summarization Tools | Complete | Content summarization for various formats |
| ✅ Time Management Coach | Complete | Study scheduling and productivity tips |
| ✅ Collaboration Helper | Complete | Study group formation and peer matching |
| ✅ Mental Health Support | Complete | Motivation and stress management |
| ✅ **Enhanced Multimodal Support** | **New** | OCR, speech recognition, math solving |
| ✅ **Smart Study Scheduling** | **New** | AI-optimized calendar integration |
| ✅ **Expense Tracking** | **New** | Budget management for students |
| ✅ **Grade Prediction** | **New** | GPA calculation and improvement tips |
| ✅ **Research Assistant** | **New** | Citation help and source recommendations |
| ✅ **Note Enhancement** | **New** | Lecture note organization and improvement |
| ✅ **Study Group Matching** | **New** | Compatible partner finding |

## 🎯 Key Features

### 🧠 Enhanced Multimodal Support
- **OCR (Optical Character Recognition)**: Extract text from handwritten notes and textbooks
- **Math Equation Recognition**: Solve mathematical problems step-by-step
- **Speech-to-Text**: Convert voice questions to text
- **Text-to-Speech**: Generate audio responses
- **Image Analysis**: Analyze diagrams, charts, and visual content

### 📅 Smart Study Scheduling
- Intelligent calendar integration
- Assignment deadline management
- Exam preparation planning
- Spaced repetition optimization
- Personal preference consideration

### 💰 Student Budget Management
- Expense categorization and tracking
- Budget analysis and recommendations
- Money-saving tips for students
- Financial planning assistance

### 📊 Grade Prediction & Analytics
- Final grade predictions with confidence levels
- GPA calculation and forecasting
- Performance trend analysis
- Personalized improvement strategies

### 📚 Research Assistant
- Academic source recommendations
- Proper citation formatting (APA, MLA, Chicago, Harvard)
- Research outline generation
- Writing tips and project timelines

### 📝 Note Enhancement
- Raw note organization and structuring
- Key point extraction
- Definition identification
- Automatic flashcard generation from notes

## 🛠 Technical Architecture

### Dependencies
```json
{
  "tesseract.js": "OCR functionality",
  "@google-cloud/speech": "Speech-to-text",
  "@google-cloud/text-to-speech": "Text-to-speech",
  "axios": "HTTP requests",
  "form-data": "Multipart form handling"
}
```

### Required Services
- **Azure OpenAI**: Core AI processing
- **Azure Computer Vision**: Image analysis
- **Google Cloud Speech**: Audio processing
- **Supabase**: Database and authentication

### Database Schema
The system uses 10+ specialized tables:
- `student_ai_context`: Conversation history and preferences
- `study_schedules`: Generated study plans
- `student_expenses`: Expense tracking
- `grade_predictions`: Academic performance analysis
- `research_projects`: Research assistance data
- `enhanced_notes`: Improved lecture notes
- `study_groups`: Group formation and management

## 📡 API Endpoints

### Core Features
```
POST /ai/ask                    # Personalized study assistant
POST /ai/flashcards            # Smart flashcard generation
POST /ai/quiz                  # Adaptive quiz generator
GET  /ai/progress              # Progress tracking
POST /ai/feedback              # Essay feedback
POST /ai/summarize             # Content summarization
POST /ai/time-management       # Time management coaching
POST /ai/collaboration         # Collaboration helper
POST /ai/motivation            # Mental health support
```

### Enhanced Features
```
POST /ai/ask-multimodal        # Enhanced multimodal support
POST /ai/study-schedule        # Smart study scheduling
POST /ai/track-expenses        # Expense tracking
POST /ai/predict-grades        # Grade prediction
POST /ai/research-assistant    # Research assistance
POST /ai/enhance-notes         # Note enhancement
POST /ai/find-study-partners   # Study group matching
```

## 🔧 Configuration

### Environment Variables
```env
# Azure OpenAI (Required)
AZURE_API_BASE=your_azure_openai_endpoint
AZURE_API_KEY=your_azure_openai_key

# Azure Computer Vision (Optional - for image analysis)
AZURE_COMPUTER_VISION_ENDPOINT=your_computer_vision_endpoint
AZURE_COMPUTER_VISION_KEY=your_computer_vision_key

# Google Cloud (Optional - for speech services)
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Supabase (Required)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Feature Flags
```env
ENABLE_MULTIMODAL_SUPPORT=true
ENABLE_SPEECH_SERVICES=true
ENABLE_COMPUTER_VISION=true
ENABLE_EXPENSE_TRACKING=true
ENABLE_GRADE_PREDICTION=true
ENABLE_RESEARCH_ASSISTANT=true
```

## 📖 Usage Examples

### Basic Study Assistant
```typescript
const response = await fetch('/api/ai/ask', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: 'student123',
    question: 'Explain recursion in programming',
    courseId: 'CS101'
  })
});
```

### Multimodal Question with Image
```typescript
const response = await fetch('/api/ai/ask-multimodal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: 'student123',
    question: 'Solve this math problem',
    imageBase64: base64ImageData
  })
});
```

### Generate Study Schedule
```typescript
const schedule = await fetch('/api/ai/study-schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    studentId: 'student123',
    courses: [{ id: 'CS101', name: 'Programming', credits: 3, difficulty: 'medium' }],
    assignments: [{ id: 'hw1', name: 'Homework 1', dueDate: '2024-02-15', estimatedHours: 4, priority: 'high' }],
    preferences: { studyHoursPerDay: 6, preferredStudyTimes: ['09:00-12:00'] }
  })
});
```

## 🎨 Frontend Integration

### React Component Example
```tsx
import React, { useState } from 'react';

const AIAssistant: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');

  const askAI = async () => {
    const result = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: 'current-user-id',
        question
      })
    });
    
    const data = await result.json();
    setResponse(data.answer);
  };

  return (
    <div>
      <textarea 
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask me anything about your studies..."
      />
      <button onClick={askAI}>Ask AI</button>
      {response && <div className="ai-response">{response}</div>}
    </div>
  );
};
```

## 🔒 Security & Privacy

### Data Protection
- Row Level Security (RLS) on all tables
- Students can only access their own data
- Encrypted API communications
- No storage of sensitive personal information

### Rate Limiting
- API rate limiting to prevent abuse
- AI service quotas to manage costs
- Request throttling for expensive operations

### Privacy Features
- Conversation history can be cleared
- Data export capabilities
- GDPR compliance ready

## 📊 Analytics & Monitoring

### Usage Tracking
- Feature usage analytics
- Performance monitoring
- Error tracking and reporting
- Cost optimization insights

### Student Insights
- Learning pattern analysis
- Progress tracking
- Engagement metrics
- Success rate monitoring

## 🚀 Performance Optimization

### Caching Strategy
- Response caching for common queries
- Database query optimization
- CDN for static assets
- Redis for session management

### Scalability
- Horizontal scaling support
- Load balancing ready
- Database connection pooling
- Async processing for heavy operations

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:e2e
```

### AI Feature Testing
```bash
# Test with mock responses (no API costs)
MOCK_AI_RESPONSES=true npm run test
```

## 📈 Future Enhancements

### Planned Features
- [ ] Real-time collaboration tools
- [ ] Advanced analytics dashboard
- [ ] Mobile app integration
- [ ] Offline mode support
- [ ] Advanced personalization
- [ ] Integration with LMS platforms

### AI Model Improvements
- [ ] Fine-tuned models for education
- [ ] Multi-language support
- [ ] Domain-specific knowledge bases
- [ ] Improved context understanding

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Install dependencies
4. Set up environment variables
5. Run tests
6. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive testing
- Documentation requirements

## 📞 Support

### Documentation
- [API Documentation](./AI_FEATURES_DOCUMENTATION.md)
- [Usage Examples](./USAGE_EXAMPLES.md)
- [Database Setup](./database-setup.sql)

### Getting Help
- Create GitHub issues for bugs
- Use discussions for questions
- Check existing documentation
- Review usage examples

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for students, by developers who understand the challenges of academic life.**

Transform your learning experience with AI-powered assistance that adapts to your unique needs and helps you achieve academic success! 🎓✨