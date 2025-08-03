import React from 'react';

// Icons for different features
export const FeatureIcons = {
  // Study Tools
  Summarize: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  StudyAssistant: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Flashcards: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Quiz: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  MultimodalAI: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  NotesEnhancer: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  ResearchAssistant: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  AssignmentFeedback: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),

  // Productivity
  StudyScheduler: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  TimeManagement: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ExpenseTracker: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  ),
  GradePredictor: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),

  // Collaboration
  StudyPartners: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Collaboration: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),

  // Wellbeing
  Motivation: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),

  // Analytics
  Progress: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
};

export interface AIFeature {
  id: string;
  name: string;
  description: string;
  category: 'study' | 'productivity' | 'collaboration' | 'wellbeing' | 'analytics';
  icon: React.ReactNode;
  path: string;
  method: 'GET' | 'POST';
  fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number' | 'file';
    placeholder?: string;
    options?: string[];
    required?: boolean;
    description?: string;
  }[];
  formTitle: string;
  formDescription?: string;
}

export const aiFeatures: AIFeature[] = [
  // Study Tools
  // {
  //   id: 'progress-tracker',
  //   name: 'Learning Progress Tracker',
  //   description: 'Track your learning progress, identify strengths and weaknesses, and get personalized recommendations.',
  //   category: 'analytics',
  //   method: 'GET',
  //   path: '/ai/progress',
  //   fields: [
  //     {
  //       name: 'studentId',
  //       label: 'Student ID',
  //       type: 'text',
  //       required: true,
  //     },
  //   ],
  //   formTitle: 'Your Learning Progress',
  //   formDescription: 'Get insights into your learning journey and personalized recommendations.',
  //   icon: '📈',
  // },

  {
    id: 'multimodal-ai',
    name: 'Multimodal AI Helper',
    description: 'Upload images of problems, diagrams, or handwritten notes. Record audio questions. Get comprehensive AI assistance.',
    category: 'study',
    icon: <FeatureIcons.MultimodalAI />,
    path: '/ai/ask-multimodal',
    method: 'POST',
    formTitle: 'Multimodal AI Assistant',
    formDescription: 'Upload images, audio, or text for comprehensive AI help with visual and audio content.',
    fields: [
      {
        name: 'question',
        label: 'Text Question (Optional)',
        type: 'textarea',
        placeholder: 'Describe what you need help with...',
      },
      {
        name: 'imageBase64',
        label: 'Upload Image (Optional)',
        type: 'file',
        description: 'Upload photos of problems, diagrams, handwritten notes, or textbook pages'
      },
      {
        name: 'audioBase64',
        label: 'Upload Audio (Optional)',
        type: 'file',
        description: 'Record your question or upload audio content for transcription and analysis'
      },
    ]
  },
  {
    id: 'smart-flashcards',
    name: 'Smart Flashcard Generator',
    description: 'Generate personalized flashcards from your notes, lectures, and study materials using AI.',
    category: 'study',
    icon: <FeatureIcons.Flashcards />,
    path: '/ai/flashcards',
    method: 'POST',
    formTitle: 'Generate Smart Flashcards',
    formDescription: 'Create personalized flashcards from your study materials.',
    fields: [
      {
        name: 'notes',
        label: 'Study Notes',
        type: 'textarea',
        placeholder: 'Paste your notes, key concepts, or study material here...',
        required: true,
      },
      {
        name: 'focusArea',
        label: 'Focus Area (Optional)',
        type: 'text',
        placeholder: 'e.g., definitions, formulas, key concepts',
        description: 'What type of flashcards do you want to focus on?'
      },
      {
        name: 'lecture',
        label: 'Lecture Topic (Optional)',
        type: 'text',
        placeholder: 'e.g., Introduction to Calculus',
      },
    ]
  },
  {
    id: 'adaptive-quiz',
    name: 'Adaptive Quiz Generator',
    description: 'Create personalized quizzes that adapt to your learning level and focus on your weak areas.',
    category: 'study',
    icon: <FeatureIcons.Quiz />,
    path: '/ai/quiz',
    method: 'POST',
    formTitle: 'Generate Adaptive Quiz',
    formDescription: 'Create a personalized quiz tailored to your learning needs.',
    fields: [
      {
        name: 'courseId',
        label: 'Course',
        type: 'text',
        placeholder: 'e.g., MATH101, PHYS201',
        required: true,
      },
      {
        name: 'focusArea',
        label: 'Topic/Focus Area',
        type: 'text',
        placeholder: 'e.g., derivatives, Newton\'s laws',
        required: true,
      },
      {
        name: 'difficulty',
        label: 'Difficulty Level',
        type: 'select',
        options: ['Beginner', 'Intermediate', 'Advanced'],
        required: true,
      },
    ]
  },
  {
    id: 'content-summarizer',
    name: 'Content Summarizer',
    description: 'Summarize articles, lectures, videos, and textbook chapters into concise, digestible notes.',
    category: 'study',
    icon: <FeatureIcons.Summarize />,
    path: '/ai/summarize',
    method: 'POST',
    formTitle: 'Summarize Content',
    formDescription: 'Get concise summaries of your study materials.',
    fields: [
      {
        name: 'text',
        label: 'Content to Summarize',
        type: 'textarea',
        placeholder: 'Paste the text, article, or notes you want summarized...',
        required: true,
      },
      {
        name: 'type',
        label: 'Content Type',
        type: 'select',
        options: ['Article', 'Lecture Notes', 'Textbook Chapter', 'Video Transcript', 'Research Paper'],
        description: 'Help AI provide better formatting for your content type'
      },
    ]
  },
  // {
  //   id: 'notes-enhancer',
  //   name: 'Notes Enhancer',
  //   description: 'Transform messy lecture notes into organized, comprehensive study materials with key points and definitions.',
  //   category: 'study',
  //   icon: <FeatureIcons.NotesEnhancer />,
  //   path: '/ai/enhance-notes',
  //   method: 'POST',
  //   formTitle: 'Enhance Your Notes',
  //   formDescription: 'Transform raw notes into organized, comprehensive study materials.',
  //   fields: [
  //     {
  //       name: 'notes',
  //       label: 'Raw Notes',
  //       type: 'textarea',
  //       placeholder: 'Paste your lecture notes, rough notes, or any study material...',
  //       required: true,
  //     },
  //     {
  //       name: 'focusArea',
  //       label: 'Subject/Topic',
  //       type: 'text',
  //       placeholder: 'e.g., Biology - Cell Structure, History - World War II',
  //       description: 'Help AI provide subject-specific enhancements'
  //     },
  //   ]
  // },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'Get help with research topics, find sources, create outlines, and format citations for your assignments.',
    category: 'study',
    icon: <FeatureIcons.ResearchAssistant />,
    path: '/ai/research-assistant',
    method: 'POST',
    formTitle: 'Research Assistant',
    formDescription: 'Get comprehensive help with your research projects and assignments.',
    fields: [
      {
        name: 'topic',
        label: 'Research Topic',
        type: 'text',
        placeholder: 'e.g., Climate Change Impact on Agriculture',
        required: true,
      },
      {
        name: 'requirements',
        label: 'Assignment Requirements',
        type: 'textarea',
        placeholder: 'Describe your assignment requirements, length, citation style, etc.',
        description: 'Include details like page length, number of sources, citation style (APA, MLA, etc.)'
      },
    ]
  },
  {
    id: 'assignment-feedback',
    name: 'Assignment Feedback',
    description: 'Get instant feedback on your essays, reports, and assignments with suggestions for improvement.',
    category: 'study',
    icon: <FeatureIcons.AssignmentFeedback />,
    path: '/ai/feedback',
    method: 'POST',
    formTitle: 'Get Assignment Feedback',
    formDescription: 'Receive detailed feedback on your writing and assignments.',
    fields: [
      {
        name: 'text',
        label: 'Assignment Text',
        type: 'textarea',
        placeholder: 'Paste your essay, report, or assignment here...',
        required: true,
      },
      {
        name: 'assignmentType',
        label: 'Assignment Type',
        type: 'select',
        options: ['Essay', 'Research Paper', 'Report', 'Lab Report', 'Creative Writing', 'Other'],
        description: 'Help AI provide more specific feedback'
      },
    ]
  },

  // Productivity Tools
  {
    id: 'study-scheduler',
    name: 'Smart Study Scheduler',
    description: 'Create optimized study schedules based on your courses, deadlines, and personal preferences.',
    category: 'productivity',
    icon: <FeatureIcons.StudyScheduler />,
    path: '/ai/study-schedule',
    method: 'POST',
    formTitle: 'Create Your Study Schedule',
    formDescription: 'Generate a personalized study schedule optimized for your success.',
    fields: [
      {
        name: 'goals',
        label: 'Study Goals',
        type: 'textarea',
        placeholder: 'e.g., Improve math grade, prepare for finals, learn programming...',
        required: true,
      },
      {
        name: 'availableTime',
        label: 'Available Study Time',
        type: 'text',
        placeholder: 'e.g., 3 hours weekdays, 5 hours weekends',
        required: true,
      },
      {
        name: 'courses',
        label: 'Current Courses',
        type: 'text',
        placeholder: 'List your courses separated by commas',
        required: true,
        description: 'e.g., Math 101, Physics 201, English 102'
      },
    ]
  },
  {
    id: 'time-management',
    name: 'Time Management Coach',
    description: 'Get personalized time management strategies, productivity tips, and deadline management help.',
    category: 'productivity',
    icon: <FeatureIcons.TimeManagement />,
    path: '/ai/time-management',
    method: 'POST',
    formTitle: 'Time Management Coaching',
    formDescription: 'Get personalized strategies to manage your time more effectively.',
    fields: [
      {
        name: 'habits',
        label: 'Current Study Habits',
        type: 'textarea',
        placeholder: 'Describe your current study routine and habits...',
      },
      {
        name: 'deadlines',
        label: 'Upcoming Deadlines',
        type: 'textarea',
        placeholder: 'List your upcoming assignments and exam dates...',
      },
      {
        name: 'goals',
        label: 'Time Management Goals',
        type: 'textarea',
        placeholder: 'What do you want to improve about your time management?',
      },
    ]
  },
  {
    id: 'expense-tracker',
    name: 'Student Expense Tracker',
    description: 'Track your student expenses, get budgeting advice, and find money-saving tips.',
    category: 'productivity',
    icon: <FeatureIcons.ExpenseTracker />,
    path: '/ai/track-expenses',
    method: 'POST',
    formTitle: 'Track Your Expenses',
    formDescription: 'Get insights into your spending and budgeting recommendations.',
    fields: [
      {
        name: 'expenses',
        label: 'Recent Expenses',
        type: 'textarea',
        placeholder: 'List your expenses: Textbooks $200, Food $150, Transport $50...',
        required: true,
        description: 'Include amounts and categories (textbooks, food, transport, etc.)'
      },
      {
        name: 'budget',
        label: 'Monthly Budget',
        type: 'number',
        placeholder: '1000',
        description: 'Your monthly budget in dollars'
      },
    ]
  },
  {
    id: 'grade-predictor',
    name: 'Grade Predictor',
    description: 'Predict your final grades based on current performance and get improvement recommendations.',
    category: 'productivity',
    icon: <FeatureIcons.GradePredictor />,
    path: '/ai/predict-grades',
    method: 'POST',
    formTitle: 'Predict Your Grades',
    formDescription: 'Get predictions for your final grades and improvement strategies.',
    fields: [
      {
        name: 'courseId',
        label: 'Course',
        type: 'text',
        placeholder: 'e.g., MATH101',
        required: true,
      },
      {
        name: 'assignments',
        label: 'Assignment Grades',
        type: 'text',
        placeholder: 'e.g., Assignment 1: 85%, Assignment 2: 92%, Assignment 3: 78%',
        required: true,
        description: 'List your assignment grades separated by commas'
      },
      {
        name: 'attendance',
        label: 'Attendance Percentage',
        type: 'number',
        placeholder: '95',
        description: 'Your attendance percentage'
      },
    ]
  },

  // Collaboration Tools
  {
    id: 'study-partners',
    name: 'Study Partner Finder',
    description: 'Find compatible study partners based on your courses, study style, and availability.',
    category: 'collaboration',
    icon: <FeatureIcons.StudyPartners />,
    path: '/ai/find-study-partners',
    method: 'POST',
    formTitle: 'Find Study Partners',
    formDescription: 'Connect with compatible study partners for better learning outcomes.',
    fields: [
      {
        name: 'interests',
        label: 'Study Interests',
        type: 'text',
        placeholder: 'e.g., Mathematics, Computer Science, Biology',
        required: true,
      },
      {
        name: 'goals',
        label: 'Study Goals',
        type: 'textarea',
        placeholder: 'What do you want to achieve through group study?',
        required: true,
      },
    ]
  },
  {
    id: 'collaboration-helper',
    name: 'Collaboration Helper',
    description: 'Get suggestions for group projects, team formation, and collaborative study strategies.',
    category: 'collaboration',
    icon: <FeatureIcons.Collaboration />,
    path: '/ai/collaboration',
    method: 'POST',
    formTitle: 'Collaboration Assistant',
    formDescription: 'Get help with group projects and collaborative learning.',
    fields: [
      {
        name: 'courseId',
        label: 'Course',
        type: 'text',
        placeholder: 'e.g., CS301',
      },
      {
        name: 'interests',
        label: 'Project Interests',
        type: 'text',
        placeholder: 'e.g., Web development, Data analysis, Research',
      },
      {
        name: 'goals',
        label: 'Collaboration Goals',
        type: 'textarea',
        placeholder: 'What do you want to achieve through collaboration?',
      },
    ]
  },

  // Wellbeing
  {
    id: 'motivation-coach',
    name: 'Motivation Coach',
    description: 'Get personalized motivation, stress management tips, and mental health support for your academic journey.',
    category: 'wellbeing',
    icon: <FeatureIcons.Motivation />,
    path: '/ai/motivation',
    method: 'POST',
    formTitle: 'Motivation & Wellbeing Support',
    formDescription: 'Get personalized motivation and mental health support.',
    fields: [
      {
        name: 'mood',
        label: 'Current Mood',
        type: 'select',
        options: ['Stressed', 'Overwhelmed', 'Unmotivated', 'Anxious', 'Tired', 'Confident', 'Neutral'],
        required: true,
      },
      {
        name: 'context',
        label: 'What\'s Going On?',
        type: 'textarea',
        placeholder: 'Describe your current situation, challenges, or what you need support with...',
        required: true,
      },
    ]
  },

  // Analytics
  {
    id: 'progress-tracker',
    name: 'Learning Progress Tracker',
    description: 'Track your learning progress, identify strengths and weaknesses, and get personalized recommendations.',
    category: 'analytics',
    icon: <FeatureIcons.Progress />,
    path: '/ai/progress',
    method: 'GET',
    formTitle: 'Your Learning Progress',
    formDescription: 'Get insights into your learning journey and personalized recommendations.',
    fields: []
  },
];

export const categoryInfo = {
  study: {
    name: 'Study Tools',
    description: 'AI-powered tools to enhance your learning experience',
    color: 'blue'
  },
  productivity: {
    name: 'Productivity',
    description: 'Manage your time, grades, and student life efficiently',
    color: 'green'
  },
  collaboration: {
    name: 'Collaboration',
    description: 'Connect and collaborate with fellow students',
    color: 'purple'
  },
  wellbeing: {
    name: 'Wellbeing',
    description: 'Support for your mental health and motivation',
    color: 'pink'
  },
  analytics: {
    name: 'Analytics',
    description: 'Track your progress and get insights',
    color: 'orange'
  }
};
