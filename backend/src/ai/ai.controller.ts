import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  // Endpoint: POST /ai/ask
  @Post('ask')
  async askQuestion(
    @Body('studentId') studentId: string,
    @Body('question') question: string,
  ): Promise<{ answer: string }> {
    const answer = await this.aiService.answerQuestion(studentId, question);
    return { answer };
  }

  // Endpoint: GET /ai/flashcards?studentId=...
  @Get('flashcards')
  async getFlashcards(
    @Query('studentId') studentId: string,
  ): Promise<{ question: string; answer: string }[]> {
    return this.aiService.getFlashcards(studentId);
  }

  // Endpoint: POST /ai/preferences
  @Post('preferences')
  async updatePreferences(
    @Body('studentId') studentId: string,
    @Body('preferences') preferences: string[],
  ): Promise<{ success: boolean }> {
    await this.aiService.updatePreferences(studentId, preferences);
    return { success: true };
  }
}
