import { Controller, Post, Body, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  // Collaboration Helper
  @UseGuards(JwtAuthGuard)
  @Post('collaboration')
  async collaborationHelper(
    @Req() req,
    @Body('courseId') courseId?: string,
    @Body('interests') interests?: string,
    @Body('goals') goals?: string,
  ): Promise<{ suggestions: string }> {
    const userId = req.user.id || req.user.sub;
    return this.aiService.collaborationHelper(userId, courseId, interests, goals);
  }

  // Enhanced Multimodal Support
  @UseGuards(JwtAuthGuard)
  @Post('ask-multimodal')
  async askMultimodal(
    @Req() req,
    @Body('question') question?: string,
    @Body('imageBase64') imageBase64?: string,
    @Body('audioBase64') audioBase64?: string,
  ): Promise<{ answer: string; audioResponse?: string }> {
    const userId = req.user.id || req.user.sub;
    return this.aiService.askMultimodal(userId, question, imageBase64, audioBase64);
  }

  // Mental Health & Motivation
  @UseGuards(JwtAuthGuard)
  @Post('motivation')
  async motivation(
    @Req() req,
    @Body('mood') mood?: string,
    @Body('context') context?: string,
  ): Promise<{ message: string }> {
    const userId = req.user.id || req.user.sub;
    return this.aiService.motivation(userId, mood, context);
  }

  // Essay/Assignment Feedback
  @UseGuards(JwtAuthGuard)
  @Post('feedback')
  async getFeedback(
    @Req() req,
    @Body('text') text: string,
    @Body('assignmentType') assignmentType?: string,
  ): Promise<{ feedback: string }> {
    const userId = req.user.id || req.user.sub;
    return this.aiService.getFeedback(userId, text, assignmentType);
  }

  // Summarization Tools
  @UseGuards(JwtAuthGuard)
  @Post('summarize')
  async summarize(
    @Req() req,
    @Body('text') text: string,
    @Body('type') type?: string, // e.g., 'article', 'lecture', 'video'
  ): Promise<{ summary: string }> {
    const userId = req.user.id || req.user.sub;
    return this.aiService.summarize(userId, text, type);
  }

  // Time Management Coach
  @UseGuards(JwtAuthGuard)
  @Post('time-management')
  async timeManagement(
    @Req() req,
    @Body('habits') habits?: string,
    @Body('deadlines') deadlines?: string,
    @Body('goals') goals?: string,
  ): Promise<{ suggestions: string }> {
    const userId = req.user.id || req.user.sub;
    return this.aiService.timeManagement(userId, habits, deadlines, goals);
  }

  // Personalized Study Assistant
  @UseGuards(JwtAuthGuard)
  @Post('ask')
  async askQuestion(
    @Req() req,
    @Body('question') question: string,
    @Body('courseId') courseId?: string,
    @Body('lessonId') lessonId?: string,
    @Body('sectionId') sectionId?: string,
  ): Promise<{ answer: string }> {
    const userId = req.user.id || req.user.sub;
    const answer = await this.aiService.answerQuestion(userId, question, courseId, lessonId, sectionId);
    return { answer };
  }

  // Smart Flashcard Generation
  @UseGuards(JwtAuthGuard)
  @Post('flashcards')
  async getFlashcards(
    @Req() req,
    @Body('notes') notes?: string,
    @Body('lecture') lecture?: string,
    @Body('pastQuestions') pastQuestions?: string,
    @Body('focusArea') focusArea?: string,
  ): Promise<{ question: string; answer: string }[]> {
    const userId = req.user.id || req.user.sub;
    return this.aiService.getFlashcards(userId, notes, lecture, pastQuestions, focusArea);
  }

  // Update Preferences
  @UseGuards(JwtAuthGuard)
  @Post('preferences')
  async updatePreferences(
    @Req() req,
    @Body('preferences') preferences: string[],
  ): Promise<{ success: boolean }> {
    const userId = req.user.id || req.user.sub;
    await this.aiService.updatePreferences(userId, preferences);
    return { success: true };
  }

  // Adaptive Quiz Generator
  @UseGuards(JwtAuthGuard)
  @Post('quiz')
  async generateQuiz(
    @Req() req,
    @Body('courseId') courseId?: string,
    @Body('lessonId') lessonId?: string,
    @Body('focusArea') focusArea?: string,
    @Body('difficulty') difficulty?: string,
  ): Promise<{ questions: { question: string; options: string[]; answer: string }[] }> {
    const userId = req.user.id || req.user.sub;
    return this.aiService.generateQuiz(userId, courseId, lessonId, focusArea, difficulty);
  }

  // Progress Tracking & Recommendations
  @UseGuards(JwtAuthGuard)
  @Get('progress')
  async getProgress(
    @Req() req,
  ): Promise<{ strengths: string[]; weaknesses: string[]; recommendations: string[] }> {
    const userId = req.user.id || req.user.sub;
    return this.aiService.getProgress(userId);
  }

  // ==================== NEW STUDENT LIFE ENDPOINTS ====================

  // Smart Calendar Integration & Study Scheduling
  @UseGuards(JwtAuthGuard)
  @Post('study-schedule')
  async generateStudySchedule(
    @Req() req,
    @Body('courses') courses: { id: string; name: string; credits: number; difficulty: string }[],
    @Body('assignments') assignments: { id: string; name: string; dueDate: string; estimatedHours: number; priority: string }[],
    @Body('exams') exams: { id: string; name: string; date: string; weight: number }[],
    @Body('preferences') preferences?: {
      studyHoursPerDay?: number;
      preferredStudyTimes?: string[];
      breakDuration?: number;
      weekendStudy?: boolean;
    },
  ) {
    const userId = req.user.id || req.user.sub;
    return this.aiService.generateStudySchedule(userId, courses, assignments, exams, preferences);
  }

  // Expense Tracking for Student Budgets
  @UseGuards(JwtAuthGuard)
  @Post('track-expenses')
  async trackExpenses(
    @Req() req,
    @Body('expenses') expenses: {
      category: 'textbooks' | 'supplies' | 'food' | 'transport' | 'entertainment' | 'other';
      amount: number;
      description: string;
      date: string;
    }[],
    @Body('monthlyBudget') monthlyBudget?: number,
  ) {
    const userId = req.user.id || req.user.sub;
    return this.aiService.trackExpenses(userId, expenses, monthlyBudget);
  }

  // Grade Prediction and GPA Calculator
  @UseGuards(JwtAuthGuard)
  @Post('predict-grades')
  async predictGrades(
    @Req() req,
    @Body('courses') courses: {
      id: string;
      name: string;
      currentGrade: number;
      assignments: { name: string; grade: number; weight: number; completed: boolean }[];
      exams: { name: string; grade?: number; weight: number; date: string }[];
      participation: number;
      attendance: number;
    }[],
  ) {
    const userId = req.user.id || req.user.sub;
    return this.aiService.predictGrades(userId, courses);
  }

  // Research Assistant for Citations and Sources
  @UseGuards(JwtAuthGuard)
  @Post('research-assistant')
  async researchAssistant(
    @Req() req,
    @Body('topic') topic: string,
    @Body('assignmentType') assignmentType: 'essay' | 'research_paper' | 'presentation' | 'thesis',
    @Body('requirements') requirements?: {
      minSources?: number;
      citationStyle?: 'APA' | 'MLA' | 'Chicago' | 'Harvard';
      academicLevel?: 'undergraduate' | 'graduate' | 'doctoral';
      pageLength?: number;
    },
  ) {
    const userId = req.user.id || req.user.sub;
    return this.aiService.researchAssistant(userId, topic, assignmentType, requirements);
  }

  // Lecture Note Organizer and Enhancer
  @UseGuards(JwtAuthGuard)
  @Post('enhance-notes')
  async enhanceLectureNotes(
    @Req() req,
    @Body('rawNotes') rawNotes: string,
    @Body('courseInfo') courseInfo: {
      name: string;
      topic: string;
      date: string;
      professor?: string;
    },
  ) {
    const userId = req.user.id || req.user.sub;
    return this.aiService.enhanceLectureNotes(userId, rawNotes, courseInfo);
  }

  // Study Group Matcher and Organizer
  @UseGuards(JwtAuthGuard)
  @Post('find-study-partners')
  async findStudyPartners(
    @Req() req,
    @Body('preferences') preferences: {
      courses: string[];
      studyStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
      availability: string[];
      location: 'online' | 'campus' | 'library' | 'flexible';
      groupSize: 'small' | 'medium' | 'large';
    },
  ) {
    const userId = req.user.id || req.user.sub;
    return this.aiService.findStudyPartners(userId, preferences);
  }

  // Explain Quiz Question
  @UseGuards(JwtAuthGuard)
  @Post('explain-quiz-question')
  async explainQuizQuestion(
    @Req() req,
    @Body('question') question: string,
    @Body('answer') answer: string,
  ): Promise<{ explanation: string }> {
    const userId = req.user.id || req.user.sub;
    const explanation = await this.aiService.explainQuizQuestion(userId, question, answer);
    return { explanation };
  }
}
