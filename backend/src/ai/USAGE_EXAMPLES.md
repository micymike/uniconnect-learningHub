# AI Features Usage Examples

## Basic Study Assistant

### Ask a Question
```bash
curl -X POST http://localhost:3000/ai/ask \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "question": "Can you explain the concept of recursion in programming?",
    "courseId": "CS101"
  }'
```

### Generate Flashcards
```bash
curl -X POST http://localhost:3000/ai/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "notes": "Recursion is a programming technique where a function calls itself...",
    "focusArea": "programming fundamentals"
  }'
```

## Enhanced Multimodal Support

### Ask Question with Image (Math Problem)
```bash
curl -X POST http://localhost:3000/ai/ask-multimodal \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "question": "Can you solve this math problem?",
    "imageBase64": "iVBORw0KGgoAAAANSUhEUgAA..."
  }'
```

### Voice Question Processing
```bash
curl -X POST http://localhost:3000/ai/ask-multimodal \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "audioBase64": "UklGRnoGAABXQVZFZm10IBAAAAABAAEA..."
  }'
```

## Smart Study Scheduling

### Generate Study Schedule
```bash
curl -X POST http://localhost:3000/ai/study-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "courses": [
      {
        "id": "CS101",
        "name": "Introduction to Programming",
        "credits": 3,
        "difficulty": "medium"
      },
      {
        "id": "MATH201",
        "name": "Calculus II",
        "credits": 4,
        "difficulty": "hard"
      }
    ],
    "assignments": [
      {
        "id": "assign1",
        "name": "Programming Project 1",
        "dueDate": "2024-02-15",
        "estimatedHours": 8,
        "priority": "high"
      }
    ],
    "exams": [
      {
        "id": "exam1",
        "name": "Midterm Exam - Calculus",
        "date": "2024-02-20",
        "weight": 30
      }
    ],
    "preferences": {
      "studyHoursPerDay": 6,
      "preferredStudyTimes": ["09:00-12:00", "14:00-17:00"],
      "breakDuration": 15,
      "weekendStudy": true
    }
  }'
```

## Expense Tracking

### Track Monthly Expenses
```bash
curl -X POST http://localhost:3000/ai/track-expenses \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "expenses": [
      {
        "category": "textbooks",
        "amount": 150.00,
        "description": "Programming textbook",
        "date": "2024-01-15"
      },
      {
        "category": "food",
        "amount": 25.50,
        "description": "Lunch at campus cafeteria",
        "date": "2024-01-16"
      },
      {
        "category": "supplies",
        "amount": 30.00,
        "description": "Notebooks and pens",
        "date": "2024-01-17"
      }
    ],
    "monthlyBudget": 800
  }'
```

## Grade Prediction

### Predict Final Grades
```bash
curl -X POST http://localhost:3000/ai/predict-grades \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "courses": [
      {
        "id": "CS101",
        "name": "Introduction to Programming",
        "currentGrade": 85,
        "assignments": [
          {
            "name": "Assignment 1",
            "grade": 90,
            "weight": 10,
            "completed": true
          },
          {
            "name": "Assignment 2",
            "grade": 85,
            "weight": 10,
            "completed": true
          },
          {
            "name": "Assignment 3",
            "grade": 0,
            "weight": 15,
            "completed": false
          }
        ],
        "exams": [
          {
            "name": "Midterm",
            "grade": 88,
            "weight": 25,
            "date": "2024-02-15"
          },
          {
            "name": "Final",
            "weight": 40,
            "date": "2024-04-20"
          }
        ],
        "participation": 95,
        "attendance": 98
      }
    ]
  }'
```

## Research Assistant

### Get Research Help
```bash
curl -X POST http://localhost:3000/ai/research-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "topic": "The Impact of Artificial Intelligence on Education",
    "assignmentType": "research_paper",
    "requirements": {
      "minSources": 10,
      "citationStyle": "APA",
      "academicLevel": "undergraduate",
      "pageLength": 15
    }
  }'
```

## Note Enhancement

### Enhance Lecture Notes
```bash
curl -X POST http://localhost:3000/ai/enhance-notes \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "rawNotes": "Today we covered recursion. Recursion is when function calls itself. Base case important. Example: factorial function. factorial(n) = n * factorial(n-1). Base case: factorial(0) = 1.",
    "courseInfo": {
      "name": "Computer Science 101",
      "topic": "Recursion in Programming",
      "date": "2024-01-18",
      "professor": "Dr. Smith"
    }
  }'
```

## Study Group Matching

### Find Study Partners
```bash
curl -X POST http://localhost:3000/ai/find-study-partners \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "preferences": {
      "courses": ["CS101", "MATH201"],
      "studyStyle": "visual",
      "availability": ["Monday 14:00-16:00", "Wednesday 10:00-12:00"],
      "location": "library",
      "groupSize": "small"
    }
  }'
```

## Quiz Generation

### Generate Adaptive Quiz
```bash
curl -X POST http://localhost:3000/ai/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "courseId": "CS101",
    "focusArea": "recursion",
    "difficulty": "medium"
  }'
```

## Progress Tracking

### Get Learning Progress
```bash
curl -X GET "http://localhost:3000/ai/progress?studentId=student123"
```

## Essay Feedback

### Get Assignment Feedback
```bash
curl -X POST http://localhost:3000/ai/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "text": "Artificial intelligence has revolutionized many industries. In education, AI can personalize learning experiences for students. This essay will explore the benefits and challenges of AI in education...",
    "assignmentType": "essay"
  }'
```

## Summarization

### Summarize Content
```bash
curl -X POST http://localhost:3000/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "text": "Long article or lecture content here...",
    "type": "article"
  }'
```

## Time Management

### Get Time Management Advice
```bash
curl -X POST http://localhost:3000/ai/time-management \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "habits": "I usually study late at night and have trouble concentrating",
    "deadlines": "Programming project due next week, calculus exam in 10 days",
    "goals": "Improve grades and reduce stress"
  }'
```

## Mental Health Support

### Get Motivational Support
```bash
curl -X POST http://localhost:3000/ai/motivation \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student123",
    "mood": "stressed",
    "context": "Feeling overwhelmed with multiple assignments and upcoming exams"
  }'
```

## JavaScript/TypeScript Examples

### Using in Frontend Application

```typescript
// Study Schedule Generation
const generateStudySchedule = async (studentData: any) => {
  try {
    const response = await fetch('/api/ai/study-schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    
    const schedule = await response.json();
    console.log('Generated Schedule:', schedule);
    return schedule;
  } catch (error) {
    console.error('Error generating schedule:', error);
  }
};

// Multimodal Question with Image
const askWithImage = async (studentId: string, question: string, imageFile: File) => {
  // Convert image to base64
  const base64Image = await fileToBase64(imageFile);
  
  try {
    const response = await fetch('/api/ai/ask-multimodal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        question,
        imageBase64: base64Image,
      }),
    });
    
    const result = await response.json();
    console.log('AI Response:', result.answer);
    
    // Play audio response if available
    if (result.audioResponse) {
      playAudioResponse(result.audioResponse);
    }
    
    return result;
  } catch (error) {
    console.error('Error asking multimodal question:', error);
  }
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };
    reader.onerror = error => reject(error);
  });
};

// Helper function to play audio response
const playAudioResponse = (base64Audio: string) => {
  const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
  audio.play();
};

// Expense Tracking
const trackExpenses = async (studentId: string, expenses: any[], budget?: number) => {
  try {
    const response = await fetch('/api/ai/track-expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        expenses,
        monthlyBudget: budget,
      }),
    });
    
    const result = await response.json();
    console.log('Expense Analysis:', result);
    return result;
  } catch (error) {
    console.error('Error tracking expenses:', error);
  }
};
```

## React Component Examples

```tsx
import React, { useState } from 'react';

// Multimodal Question Component
const MultimodalQuestion: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageBase64 = '';
      if (image) {
        imageBase64 = await fileToBase64(image);
      }

      const result = await fetch('/api/ai/ask-multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'current-student-id',
          question,
          imageBase64,
        }),
      });

      const data = await result.json();
      setResponse(data.answer);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="multimodal-question">
      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your question..."
          rows={4}
        />
        
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Ask AI'}
        </button>
      </form>
      
      {response && (
        <div className="response">
          <h3>AI Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

// Study Schedule Component
const StudySchedule: React.FC = () => {
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateSchedule = async () => {
    setLoading(true);
    
    const scheduleData = {
      studentId: 'current-student-id',
      courses: [
        { id: 'CS101', name: 'Programming', credits: 3, difficulty: 'medium' },
        { id: 'MATH201', name: 'Calculus', credits: 4, difficulty: 'hard' },
      ],
      assignments: [
        {
          id: 'assign1',
          name: 'Programming Project',
          dueDate: '2024-02-15',
          estimatedHours: 8,
          priority: 'high',
        },
      ],
      exams: [
        {
          id: 'exam1',
          name: 'Calculus Midterm',
          date: '2024-02-20',
          weight: 30,
        },
      ],
      preferences: {
        studyHoursPerDay: 6,
        preferredStudyTimes: ['09:00-12:00', '14:00-17:00'],
        weekendStudy: true,
      },
    };

    try {
      const response = await fetch('/api/ai/study-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });

      const result = await response.json();
      setSchedule(result);
    } catch (error) {
      console.error('Error generating schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="study-schedule">
      <button onClick={generateSchedule} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Study Schedule'}
      </button>
      
      {schedule && (
        <div className="schedule-display">
          <h3>Your Personalized Study Schedule</h3>
          {schedule.schedule?.map((day: any, index: number) => (
            <div key={index} className="day-schedule">
              <h4>{day.date}</h4>
              {day.tasks?.map((task: any, taskIndex: number) => (
                <div key={taskIndex} className="task">
                  <span className="time">{task.time}</span>
                  <span className="subject">{task.subject}</span>
                  <span className="description">{task.description}</span>
                </div>
              ))}
            </div>
          ))}
          
          <div className="recommendations">
            <h4>Recommendations:</h4>
            <ul>
              {schedule.recommendations?.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
```

These examples demonstrate how to integrate all the AI features into your application, providing students with a comprehensive, intelligent learning assistant.