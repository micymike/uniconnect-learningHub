import { Controller, Post, Body, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIService } from './ai.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

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

  // Study Buddy Chatbot
  @UseGuards(JwtAuthGuard)
  @Post('chat')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async studyBuddyChat(
    @Req() req,
    @Body('message') message: string,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<{ reply: string }> {
    const userId = req.user.userId;
    const reply = await this.aiService.studyBuddyChat(userId, message, image);
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
}
