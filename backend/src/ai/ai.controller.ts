import { Controller, Post, Body, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIService } from './ai.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  // Study Buddy Chatbot
  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async studyBuddyChat(
    @Req() req,
    @Body('message') message: string,
  ): Promise<{ reply: string }> {
    const userId = req.user.userId;
    const reply = await this.aiService.studyBuddyChat(userId, message);
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
}
