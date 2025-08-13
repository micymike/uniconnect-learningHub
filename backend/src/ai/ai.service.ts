import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import axios from 'axios';
import { Express } from 'express';

@Injectable()
export class AIService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private supabase: SupabaseClient<Database>,
  ) {}

  // Study Buddy Chatbot (memory-enabled, friendly)
  async studyBuddyChat(
    studentId: string,
    message: string
  ): Promise<string> {
    // Retrieve or create student context
    let { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!context) {
      // Create new context
      const { data: newContext, error: insertError } = await this.supabase
        .from('student_ai_context')
        .insert({
          student_id: studentId,
          conversation_history: [],
          flashcard_preferences: [],
          personalization: {},
        })
        .select('*')
        .maybeSingle();
      if (insertError) throw insertError;
      context = newContext;
    }

    // Prepare conversation history for context (limit to last 20 exchanges)
    const history = context.conversation_history || [];
    const prompt = [
      "You are Study Buddy, a friendly, supportive AI chat companion for students. Your personality adapts to the user's vibe: be casual, encouraging, and relatable if the user is informal, and more professional if the user is formal. Always be helpful, positive, and make the student feel comfortable. Use emojis and friendly language when appropriate. Remember the conversation and respond like a smart, caring friend.",
      "Here is the conversation so far:",
      ...history,
      `Q: ${message}`,
      "A:"
    ].join('\n');

    // Call Azure OpenAI
    const aiReply = await this.callAzureOpenAI(prompt);

    // Store the new Q&A in conversation history
    const updatedHistory = [...history, `Q: ${message}`, `A: ${aiReply}`].slice(-20);

    // Update context in Supabase
    const { error: updateError } = await this.supabase
      .from('student_ai_context')
      .update({ conversation_history: updatedHistory })
      .eq('student_id', studentId);

    if (updateError) throw updateError;

    return aiReply;
  }

  // Flashcard Generator
  async generateFlashcards(
    userId: string,
    text: string,
    numQuestions: number,
    file?: any,
  ): Promise<{ flashcards: { question: string; answer: string }[] }> {
    let inputText = text;
    if (file) {
      // Parse PDF or DOCX file to extract text
      const buffer = file.buffer || file;
      const originalName = file.originalname || file.name || "";
      if (originalName.endsWith(".pdf")) {
        // PDF
        const pdfParse = require("pdf-parse");
        const data = await pdfParse(buffer);
        inputText = data.text;
      } else if (originalName.endsWith(".docx") || originalName.endsWith(".doc")) {
        // DOCX
        const mammoth = require("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        inputText = result.value;
      } else {
        throw new Error("Unsupported file type. Only PDF and DOCX are supported.");
      }
    }
    // Prepare prompt for OpenAI
    const prompt = [
      "You are an AI that generates study flashcards for students. Given the following material, create " +
        numQuestions +
        " flashcards. Each flashcard should have a question and a concise answer. Respond ONLY with a valid JSON array: [{\"question\": \"\", \"answer\": \"\"}, ...] and nothing else.",
      "Material:",
      inputText,
    ].join("\n");

    // Call Azure OpenAI
    let flashcards: { question: string; answer: string }[] = [];
    try {
      const aiResponse = await this.callAzureOpenAI(prompt);
      // Try to parse JSON from response
      const match = aiResponse.match(/\[.*\]/s);
      if (match) {
        flashcards = JSON.parse(match[0]);
      } else {
        throw new Error("AI response did not contain a valid JSON array.");
      }
    } catch (err) {
      throw new Error("Failed to generate flashcards: " + (err as Error).message);
    }
    return { flashcards };
  }

  // Explain Flashcard
  async explainFlashcard(
    userId: string,
    question: string,
    answer: string
  ): Promise<string> {
    const prompt = [
      "You are an AI tutor. Given the following flashcard, provide a friendly, student-focused explanation for the answer. Be clear, supportive, and use simple language.",
      `Question: ${question}`,
      `Answer: ${answer}`,
      "Explanation:"
    ].join("\n");

    const explanation = await this.callAzureOpenAI(prompt);
    return explanation;
  }

  // Helper: Call Azure OpenAI API
  private async callAzureOpenAI(prompt: string): Promise<string> {
    const endpoint = process.env.AZURE_API_BASE!;
    const apiKey = process.env.AZURE_API_KEY!;

    const response = await axios.post(
      endpoint,
      {
        messages: [
          { role: 'system', content: 'You are a friendly, supportive AI buddy for students. Adapt your personality to the user\'s vibe, be encouraging, relatable, and always helpful. Use friendly language and emojis when appropriate.' },
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
}
