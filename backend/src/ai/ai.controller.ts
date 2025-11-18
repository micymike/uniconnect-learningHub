import { Controller, Post, Get, Body, UseGuards, Req, UploadedFile, UseInterceptors, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIService } from './ai.service';
import { MathGPTService } from './mathgpt.service';
import { AITeacherService } from './ai-teacher.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly mathGPTService: MathGPTService,
    private readonly aiTeacherService: AITeacherService
  ) {}

  /**
   * POST /ai/save-flashcard
   * Save a flashcard for the authenticated user.
   * Body: { question: string, answer: string }
   * Returns: { id, question, answer, created_at }
   */
  @UseGuards(JwtAuthGuard)
  @Post('save-flashcard')
  async saveFlashcard(
    @Req() req,
    @Body('question') question: string,
    @Body('answer') answer: string
  ) {
    const userId = req.user.userId;
    return await this.aiService.saveFlashcard(userId, question, answer);
  }

  /**
   * GET /ai/flashcards
   * Get all saved flashcards for the authenticated user.
   * Returns: [{ id, question, answer, created_at }]
   */
  @UseGuards(JwtAuthGuard)
  @Get('flashcards')
  async getFlashcards(@Req() req) {
    const userId = req.user.userId;
    return await this.aiService.getFlashcards(userId);
  }

  /**
   * POST /ai/agents-chat
   * Returns a merged answer from multiple Study Buddy agents (explainer, summarizer, example giver, quizzer).
   * Body: { message: string, context?: any }
   * Auth required (student JWT)
   */
  @UseGuards(JwtAuthGuard)
  @Post('agents-chat')
  async agentsChat(@Req() req, @Body() body: { message: string; context?: any }) {
    // Extract studentId from JWT (assume req.user is set by auth middleware)
    const studentId = req.user?.userId || req.user?.id || req.body.studentId;
    if (!studentId) {
      return { error: "Missing studentId in JWT or request." };
    }
    if (!body.message || typeof body.message !== "string") {
      return { error: "Missing or invalid message." };
    }
    const answer = await this.aiService.studyBuddyAgentsChat(studentId, body.message, body.context);
    return { reply: answer };
  }
  // Analyze Image (OCR + AI Explanation)
  @UseGuards(JwtAuthGuard)
  @Post('analyze-image')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async analyzeImage(
    @Req() req,
    @UploadedFile() image: Express.Multer.File,
    @Body('prompt') prompt: string,
  ): Promise<{ explanation: string }> {
    const userId = req.user.userId;
    const explanation = await this.aiService.analyzeImage(userId, image, prompt);
    return { explanation };
  }

  // Dynamic Learning Path
  @UseGuards(JwtAuthGuard)
  @Post('learning-path')
  async generateLearningPath(
    @Req() req,
    @Body('performanceData') performanceData: any,
  ): Promise<{ learningPath: { id: string; title: string; description: string }[] }> {
    const userId = req.user.userId;
    return await this.aiService.generateLearningPath(userId, performanceData);
  }
  // Smart Quiz Generator
  @UseGuards(JwtAuthGuard)
  @Post('generate-quiz')
  async generateSmartQuiz(
    @Req() req,
    @Body() body: any,
  ): Promise<{ quiz: { question: string; options: string[]; answer: string; explanation?: string }[] }> {
    const userId = req.user.userId;
    const { notes, quizHistory, numQuestions = 5 } = body;
    return await this.aiService.generateSmartQuiz(userId, notes, quizHistory, numQuestions);
  }

  // Study Buddy Chatbot
  @UseGuards(JwtAuthGuard)
  @Post('chat')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async studyBuddyChat(
    @Req() req,
    @Body('message') message: string,
    @Body('context') context: any,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<{ reply: string }> {
    const userId = req.user.userId;
    const reply = await this.aiService.studyBuddyChat(userId, message, image, context);
    return { reply };
  }

  // Flashcard Generator
  @UseGuards(JwtAuthGuard)
  @Post('flashcards')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 2 * 1024 * 1024 } }))
  async generateFlashcards(
    @Req() req,
    @Body('text') text: string,
    @Body('numQuestions') numQuestions: number,
    @UploadedFile() file?: any,
  ): Promise<{ flashcards: { question: string; answer: string }[] }> {
    const userId = req.user.userId;
    return await this.aiService.generateFlashcards(userId, text, numQuestions, file);
  }

  // Flashcard Explanation
  @UseGuards(JwtAuthGuard)
  @Post('explain-flashcard')
  async explainFlashcard(
    @Req() req,
    @Body('question') question: string,
    @Body('answer') answer: string,
  ): Promise<{ explanation: string }> {
    const userId = req.user.userId;
    const explanation = await this.aiService.explainFlashcard(userId, question, answer);
    return { explanation };
  }

  // Flashcard AI Answer Check
  @UseGuards(JwtAuthGuard)
  @Post('check-flashcard-answer')
  async checkFlashcardAnswer(
    @Req() req,
    @Body('question') question: string,
    @Body('answer') answer: string,
    @Body('userAnswer') userAnswer: string,
  ): Promise<{ correct: boolean, feedback?: string }> {
    const userId = req.user.userId;
    return await this.aiService.checkFlashcardAnswer(userId, question, answer, userAnswer);
  }

  // Matching Game Pairs
  @UseGuards(JwtAuthGuard)
  @Post('matching-pairs')
  async getMatchingPairs(
    @Req() req,
    @Body('text') text: string,
    @Body('numPairs') numPairs: number = 8,
  ): Promise<{ pairs: { term: string; definition: string }[] }> {
    const userId = req.user.userId;
    return await this.aiService.getMatchingPairs(userId, text, numPairs);
  }

  // Study Assistant: Ask about uploaded document
  @UseGuards(JwtAuthGuard)
  @Post('study-assist')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async studyAssist(
    @Req() req,
    @Body('question') question: string,
    @Body('pdfUrl') pdfUrl?: string,
    @UploadedFile() file?: any,
  ): Promise<{ answer: string }> {
    const userId = req.user.userId;
    const answer = await this.aiService.studyAssist(userId, question, file, pdfUrl);
    return { answer };
  }

  // MathGPT: Solve math problems with video explanations
  @UseGuards(JwtAuthGuard)
  @Post('solve-math')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async solveMathProblem(
    @Req() req,
    @Body('problem') problem: string,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<{ solution: any; videoScript: any }> {
    const userId = req.user.userId;
    const solution = await this.mathGPTService.solveMathProblem(userId, problem, image);
    const videoScript = await this.mathGPTService.generateVideoScript(solution);
    return { solution, videoScript };
  }

  // AI Teacher: Start teaching session
  @UseGuards(JwtAuthGuard)
  @Post('teacher/start')
  @UseInterceptors(FileInterceptor('pdf', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async startTeaching(
    @Req() req,
    @Body('topic') topic?: string,
    @UploadedFile() pdf?: Express.Multer.File,
  ): Promise<{ sessionId: string; introduction: string; blackboardContent: string }> {
    const userId = req.user.userId;
    let pdfContent;
    if (pdf) {
      pdfContent = await this.aiTeacherService.processPDF(pdf);
    }
    return await this.aiTeacherService.startTeachingSession(userId, topic, pdfContent);
  }

  // AI Teacher: Continue conversation
  @UseGuards(JwtAuthGuard)
  @Post('teacher/continue')
  async continueTeaching(
    @Req() req,
    @Body('sessionId') sessionId: string,
    @Body('message') message: string,
    @Body('isInterruption') isInterruption: boolean = false,
  ): Promise<{ response: string; blackboardUpdate?: string; suggestedNotes?: string }> {
    return await this.aiTeacherService.continueTeaching(sessionId, message, isInterruption);
  }

  // AI Teacher: Save student notes
  @UseGuards(JwtAuthGuard)
  @Post('teacher/notes')
  async saveNotes(
    @Req() req,
    @Body('sessionId') sessionId: string,
    @Body('notes') notes: string,
  ): Promise<{ success: boolean }> {
    await this.aiTeacherService.saveStudentNotes(sessionId, notes);
    return { success: true };
  }

  // AI Teacher: Get session history
  @UseGuards(JwtAuthGuard)
  @Get('teacher/session/:id')
  async getSession(
    @Req() req,
    @Param('id') sessionId: string,
  ): Promise<{ conversation: string[]; blackboard: string[]; notes: any[]; topic: string }> {
    return await this.aiTeacherService.getSessionHistory(sessionId);
  }
}
