import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StudentAIContext, StudentAIContextDocument } from './ai.schema';

// You will need to install axios or use fetch for HTTP requests to Azure OpenAI
import axios from 'axios';

@Injectable()
export class AIService {
  constructor(
    @InjectModel(StudentAIContext.name)
    private studentAIContextModel: Model<StudentAIContextDocument>,
  ) {}

  // Answer a student's question using Azure OpenAI and store the conversation
  async answerQuestion(studentId: string, question: string): Promise<string> {
    // Retrieve or create student context
    let context = await this.studentAIContextModel.findOne({ studentId });
    if (!context) {
      context = new this.studentAIContextModel({ studentId });
    }

    // Prepare conversation history for context (optional: limit to last N messages)
    const history = context.conversationHistory || [];
    const prompt = this.buildPrompt(history, question);

    // Call Azure OpenAI (replace with your endpoint and key)
    const azureResponse = await this.callAzureOpenAI(prompt);

    // Store the new Q&A in conversation history
    history.push(`Q: ${question}`);
    history.push(`A: ${azureResponse}`);
    context.conversationHistory = history.slice(-20); // Keep last 20 exchanges
    await context.save();

    return azureResponse;
  }

  // Generate flashcards based on student preferences and history
  async getFlashcards(studentId: string): Promise<{ question: string; answer: string }[]> {
    const context = await this.studentAIContextModel.findOne({ studentId });
    const preferences = context?.flashcardPreferences || [];
    const history = context?.conversationHistory || [];

    // Build a prompt for flashcard generation
    const prompt = this.buildFlashcardPrompt(preferences, history);

    // Call Azure OpenAI to generate flashcards
    const flashcardsText = await this.callAzureOpenAI(prompt);

    // Parse the response into Q&A pairs (simple parsing, can be improved)
    return this.parseFlashcards(flashcardsText);
  }

  // Update student flashcard preferences
  async updatePreferences(studentId: string, preferences: string[]): Promise<void> {
    let context = await this.studentAIContextModel.findOne({ studentId });
    if (!context) {
      context = new this.studentAIContextModel({ studentId });
    }
    context.flashcardPreferences = preferences;
    await context.save();
  }

  // Helper: Build prompt for Q&A
  private buildPrompt(history: string[], question: string): string {
    return [
      'You are a helpful AI study partner. Here is the conversation so far:',
      ...history,
      `Q: ${question}`,
      'A:'
    ].join('\n');
  }

  // Helper: Build prompt for flashcard generation
  private buildFlashcardPrompt(preferences: string[], history: string[]): string {
    return [
      'You are a helpful AI that generates flashcards for students.',
      `Student preferences: ${preferences.join(', ')}`,
      'Recent conversation:',
      ...history.slice(-10),
      'Generate 5 flashcards (Q&A) based on the above.'
    ].join('\n');
  }

  // Helper: Call Azure OpenAI API (stub, replace with real implementation)
  private async callAzureOpenAI(prompt: string): Promise<string> {
    // Use Azure OpenAI endpoint and API key from .env
    const endpoint = process.env.AZURE_API_BASE!;
    const apiKey = process.env.AZURE_API_KEY!;

    const response = await axios.post(
      endpoint,
      {
        messages: [
          { role: 'system', content: 'You are a helpful AI study partner.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 512,
        temperature: 0.7,
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  }

  // Helper: Parse flashcards from text (simple format: Q: ... A: ...)
  private parseFlashcards(text: string): { question: string; answer: string }[] {
    const cards: { question: string; answer: string }[] = [];
    const lines = text.split('\n');
    let q = '', a = '';
    for (const line of lines) {
      if (line.startsWith('Q:')) {
        if (q && a) cards.push({ question: q, answer: a });
        q = line.replace('Q:', '').trim();
        a = '';
      } else if (line.startsWith('A:')) {
        a = line.replace('A:', '').trim();
      }
    }
    if (q && a) cards.push({ question: q, answer: a });
    return cards;
  }
}
