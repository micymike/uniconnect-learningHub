import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { StudentAIContext } from './ai.schema';
import axios from 'axios';
import * as FormData from 'form-data';
import { createWorker } from 'tesseract.js';
import * as speech from '@google-cloud/speech';
import * as textToSpeech from '@google-cloud/text-to-speech';

@Injectable()
export class AIService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private supabase: SupabaseClient<Database>,
  ) {}

  // Answer a student's question using Azure OpenAI and store the conversation
  async answerQuestion(
    studentId: string,
    question: string,
    courseId?: string,
    lessonId?: string,
    sectionId?: string,
  ): Promise<string> {
    // Retrieve or create student context
    let { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
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
        .single();
      if (insertError) throw insertError;
      context = newContext;
    }

    // Prepare conversation history for context (optional: limit to last N messages)
    const history = context.conversation_history || [];
    const prompt = this.buildPromptWithContext(history, question, courseId, lessonId, sectionId);

    // Call Azure OpenAI (replace with your endpoint and key)
    const azureResponse = await this.callAzureOpenAI(prompt);

    // Store the new Q&A in conversation history
    const updatedHistory = [...history, `Q: ${question}`, `A: ${azureResponse}`].slice(-20); // Keep last 20 exchanges

    // Update context in Supabase
    const { error: updateError } = await this.supabase
      .from('student_ai_context')
      .update({ conversation_history: updatedHistory })
      .eq('student_id', studentId);

    if (updateError) throw updateError;

    return azureResponse;
  }

  // Generate flashcards based on student preferences, history, and additional context
  async getFlashcards(
    studentId: string,
    notes?: string,
    lecture?: string,
    pastQuestions?: string,
    focusArea?: string,
  ): Promise<{ question: string; answer: string }[]> {
    const { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error) throw error;

    const preferences = context?.flashcard_preferences || [];
    const history = context?.conversation_history || [];

    // Build a prompt for flashcard generation with additional context
    const prompt = this.buildFlashcardPromptWithContext(
      preferences,
      history,
      notes,
      lecture,
      pastQuestions,
      focusArea
    );

    // Call Azure OpenAI to generate flashcards
    const flashcardsText = await this.callAzureOpenAI(prompt);

    // Parse the response into Q&A pairs (simple parsing, can be improved)
    return this.parseFlashcards(flashcardsText);
  }

  // Update student flashcard preferences
  async updatePreferences(studentId: string, preferences: string[]): Promise<void> {
    // Retrieve or create student context
    let { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!context) {
      // Create new context
      const { error: insertError } = await this.supabase
        .from('student_ai_context')
        .insert({
          student_id: studentId,
          conversation_history: [],
          flashcard_preferences: preferences,
          personalization: {},
        });
      if (insertError) throw insertError;
    } else {
      // Update preferences
      const { error: updateError } = await this.supabase
        .from('student_ai_context')
        .update({ flashcard_preferences: preferences })
        .eq('student_id', studentId);
      if (updateError) throw updateError;
    }
  }

  // Helper: Build prompt for Q&A with optional context
  private buildPromptWithContext(
    history: string[],
    question: string,
    courseId?: string,
    lessonId?: string,
    sectionId?: string,
  ): string {
    const contextLines: string[] = [];
    if (courseId) contextLines.push(`Course ID: ${courseId}`);
    if (lessonId) contextLines.push(`Lesson ID: ${lessonId}`);
    if (sectionId) contextLines.push(`Section ID: ${sectionId}`);

    return [
      'You are a helpful AI study assistant. Use the provided context to answer the student\'s question, explain difficult concepts, and provide step-by-step solutions.',
      ...contextLines,
      'Here is the conversation so far:',
      ...history,
      `Q: ${question}`,
      'A:'
    ].join('\n');
  }

  // Helper: Build prompt for flashcard generation with additional context
  private buildFlashcardPromptWithContext(
    preferences: string[],
    history: string[],
    notes?: string,
    lecture?: string,
    pastQuestions?: string,
    focusArea?: string,
  ): string {
    const contextLines: string[] = [];
    if (notes) contextLines.push(`Notes: ${notes}`);
    if (lecture) contextLines.push(`Lecture: ${lecture}`);
    if (pastQuestions) contextLines.push(`Past Questions: ${pastQuestions}`);
    if (focusArea) contextLines.push(`Focus Area: ${focusArea}`);

    return [
      'You are a helpful AI that generates flashcards for students.',
      `Student preferences: ${preferences.join(', ')}`,
      ...contextLines,
      'Recent conversation:',
      ...history.slice(-10),
      'Generate 5 flashcards (Q&A) based on the above, focusing on the student\'s weak areas and provided materials.'
    ].join('\n');
  }

  // Helper: Call Azure OpenAI API (stub, replace with real implementation)
  private async callAzureOpenAI(prompt: string): Promise<string> {
    // Use Azure OpenAI endpoint and API key from .env
    const endpoint = process.env.AZURE_API_BASE!;
    const apiKey = process.env.AZURE_API_KEY!;

    // Use high token limit for comprehensive responses (128k for research assistant)
    const maxTokens = prompt.includes('research assistant') || prompt.includes('JSON format') ? 32072 : 2048;

    const response = await axios.post(
      endpoint,
      {
        messages: [
          { role: 'system', content: 'You are a helpful AI study partner.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
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

  // Adaptive Quiz Generator
  async generateQuiz(
    studentId: string,
    courseId?: string,
    lessonId?: string,
    focusArea?: string,
    difficulty?: string,
  ): Promise<{ questions: { question: string; options: string[]; answer: string }[] }> {
    // Fetch student context
    const { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) throw error;

    const history = context?.conversation_history || [];
    const preferences = context?.flashcard_preferences || [];

    // Build prompt for quiz generation
    const prompt = [
      'You are an AI that generates adaptive quizzes for students.',
      courseId ? `Course ID: ${courseId}` : '',
      lessonId ? `Lesson ID: ${lessonId}` : '',
      focusArea ? `Focus Area: ${focusArea}` : '',
      difficulty ? `Difficulty: ${difficulty}` : '',
      `Student preferences: ${preferences.join(', ')}`,
      'Recent conversation/history:',
      ...history.slice(-10),
      'Generate a quiz with 5 questions. Each question should have 4 options and indicate the correct answer. Adapt the questions to the student\'s learning progress and weak areas.'
    ].filter(Boolean).join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);
    console.log("Raw AI response for quiz generation:", aiResponse);
    // Parse the AI response into quiz questions
    const questions = this.parseQuiz(aiResponse);
    console.log("Parsed quiz questions:", questions);
    return { questions };
  }

  // Helper: Parse quiz from AI response (robust markdown and Q:/Options:/Answer: support)
  private parseQuiz(text: string): { question: string; options: string[]; answer: string }[] {
    const questions: { question: string; options: string[]; answer: string }[] = [];
    const lines = text.split('\n');
    let i = 0;
    while (i < lines.length) {
      let line = lines[i].trim();
      // Markdown-style: **Question X:**
      if (line.startsWith('**Question') && line.includes(':**')) {
        // Extract question text
        let q = line.replace(/\*\*Question\s*\d+:\*\*/, '').replace(':', '').trim();
        if (!q) {
          // Sometimes question is on the next line
          i++;
          q = (lines[i] || '').trim();
        }
        // Collect next 4 options (A, B, C, D)
        const opts: string[] = [];
        let optCount = 0;
        let j = i + 1;
        while (optCount < 4 && j < lines.length) {
          const optLine = lines[j].trim();
          const optMatch = optLine.match(/^[A-D]\)\s*(.*)/);
          if (optMatch) {
            opts.push(optMatch[1]);
            optCount++;
          }
          j++;
        }
        // Find the next "**Correct Answer:**" line for the answer
        let a = '';
        while (j < lines.length) {
          const ansLine = lines[j].trim();
          if (ansLine.startsWith('**Correct Answer:**')) {
            a = ansLine.replace('**Correct Answer:**', '').trim();
            break;
          }
          j++;
        }
        if (q && opts.length === 4 && a) {
          questions.push({ question: q, options: opts, answer: a });
        }
        // Move i to after the answer line or next question
        i = j + 1;
        continue;
      }
      // Old format: Q:/Options:/Answer:
      if (line.startsWith('Q:')) {
        let q = line.replace('Q:', '').trim();
        let opts: string[] = [];
        let a = '';
        i++;
        // Look for Options and Answer
        while (i < lines.length) {
          const l = lines[i].trim();
          if (l.startsWith('Options:')) {
            opts = l.replace('Options:', '').split(';').map(opt => opt.trim()).filter(Boolean);
          } else if (l.startsWith('Answer:')) {
            a = l.replace('Answer:', '').trim();
            break;
          }
          i++;
        }
        if (q && opts.length && a) {
          questions.push({ question: q, options: opts, answer: a });
        }
        continue;
      }
      i++;
    }
    return questions;
  }

  // Progress Tracking & Recommendations
  async getProgress(
    studentId: string
  ): Promise<{ strengths: string[]; weaknesses: string[]; recommendations: string[] }> {
    // Fetch student context
    const { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) throw error;

    const history = context?.conversation_history || [];
    const preferences = context?.flashcard_preferences || [];

    // Build prompt for progress analysis
    const prompt = [
      'You are an AI tutor that analyzes student progress.',
      `Student preferences: ${preferences.join(', ')}`,
      'Recent conversation/history:',
      ...history.slice(-20),
      'Based on the above, list:',
      '1. The student\'s strengths (as an array)',
      '2. The student\'s weaknesses (as an array)',
      '3. Personalized study recommendations (as an array)'
    ].join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);

    // Parse the AI response (expects three arrays, one per line)
    const [strengthsLine, weaknessesLine, recommendationsLine] = aiResponse.split('\n').map(l => l.trim());
    const strengths = this.parseArrayLine(strengthsLine);
    const weaknesses = this.parseArrayLine(weaknessesLine);
    const recommendations = this.parseArrayLine(recommendationsLine);

    return { strengths, weaknesses, recommendations };
  }

  // Helper: Parse array from a line like: [ "item1", "item2" ]
  private parseArrayLine(line: string): string[] {
    try {
      const match = line.match(/\[.*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch {}
    return [];
  }

  // Essay/Assignment Feedback
  async getFeedback(
    studentId: string,
    text: string,
    assignmentType?: string,
  ): Promise<{ feedback: string }> {
    const { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) throw error;

    const preferences = context?.flashcard_preferences || [];

    const prompt = [
      'You are an expert writing tutor. Provide instant, constructive feedback on the following assignment.',
      assignmentType ? `Assignment type: ${assignmentType}` : '',
      `Student preferences: ${preferences.join(', ')}`,
      'Assignment text:',
      text,
      'Give feedback on grammar, structure, and content. Suggest improvements.'
    ].filter(Boolean).join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);
    return { feedback: aiResponse };
  }

  // Summarization Tools
  async summarize(
    studentId: string,
    text: string,
    type?: string, // e.g., 'article', 'lecture', 'video'
  ): Promise<{ summary: string }> {
    const { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) throw error;

    const preferences = context?.flashcard_preferences || [];

    const prompt = [
      'You are an AI that summarizes educational content.',
      type ? `Content type: ${type}` : '',
      `Student preferences: ${preferences.join(', ')}`,
      'Content to summarize:',
      text,
      'Summarize the above into concise notes or key points.'
    ].filter(Boolean).join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);
    return { summary: aiResponse };
  }

  // Time Management Coach
  async timeManagement(
    studentId: string,
    habits?: string,
    deadlines?: string,
    goals?: string,
  ): Promise<{ suggestions: string }> {
    const { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) throw error;

    const preferences = context?.flashcard_preferences || [];

    const prompt = [
      'You are an AI time management coach for students.',
      `Student preferences: ${preferences.join(', ')}`,
      habits ? `Study habits: ${habits}` : '',
      deadlines ? `Upcoming deadlines: ${deadlines}` : '',
      goals ? `Study goals: ${goals}` : '',
      'Based on the above, suggest a study schedule, reminders, and productivity tips.'
    ].filter(Boolean).join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);
    return { suggestions: aiResponse };
  }

  // Collaboration Helper
  async collaborationHelper(
    studentId: string,
    courseId?: string,
    interests?: string,
    goals?: string,
  ): Promise<{ suggestions: string }> {
    const { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) throw error;

    const preferences = context?.flashcard_preferences || [];

    const prompt = [
      'You are an AI collaboration helper for students.',
      courseId ? `Course ID: ${courseId}` : '',
      interests ? `Student interests: ${interests}` : '',
      goals ? `Study goals: ${goals}` : '',
      `Student preferences: ${preferences.join(', ')}`,
      'Suggest study groups, peers to connect with, or ways to facilitate group discussions based on the above.'
    ].filter(Boolean).join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);
    return { suggestions: aiResponse };
  }

  // Enhanced Multimodal Support with OCR, ASR, and Math Recognition
  async askMultimodal(
    studentId: string,
    question?: string,
    imageBase64?: string,
    audioBase64?: string,
  ): Promise<{ answer: string }> {
    const { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) throw error;

    const preferences = context?.flashcard_preferences || [];
    const multimodalContext: string[] = [];
    
    // Process text question
    if (question) multimodalContext.push(`Question: ${question}`);
    
    // Process image with OCR and analysis
    if (imageBase64) {
      const imageAnalysis = await this.processImage(imageBase64);
      multimodalContext.push(`Image Analysis: ${imageAnalysis}`);
    }
    
    // Audio processing and audio response generation are disabled for now

    const prompt = [
      'You are an advanced multimodal AI assistant for students.',
      `Student preferences: ${preferences.join(', ')}`,
      ...multimodalContext,
      'Provide comprehensive help based on the above. If math equations are present, solve them step by step. If diagrams are present, explain them clearly.'
    ].filter(Boolean).join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);

    return { answer: aiResponse };
  }

  // OCR and Image Analysis
  private async processImage(imageBase64: string): Promise<string> {
    try {
      // Convert base64 to buffer
      const imageBuffer = Buffer.from(imageBase64, 'base64');
      
      // Initialize Tesseract worker for OCR
      const worker = await createWorker();
      await worker.reinitialize('eng');
      
      // Perform OCR
      const { data: { text } } = await worker.recognize(imageBuffer);
      await worker.terminate();
      
      // Analyze for math equations
      const mathAnalysis = await this.analyzeMathContent(text);
      
      // Analyze for diagrams/charts (using Azure Computer Vision)
      const visualAnalysis = await this.analyzeImageContent(imageBase64);
      
      return `OCR Text: ${text}\nMath Analysis: ${mathAnalysis}\nVisual Analysis: ${visualAnalysis}`;
    } catch (error) {
      console.error('Image processing error:', error);
      return 'Unable to process image content.';
    }
  }

  // Audio Processing with Speech-to-Text
  private async processAudio(audioBase64: string): Promise<string> {
    try {
      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audioBase64, 'base64');
      
      // Initialize Google Speech-to-Text client
      const client = new speech.SpeechClient();
      
      const request = {
        audio: { content: audioBuffer },
        config: {
          encoding: 'WEBM_OPUS' as const,
          sampleRateHertz: 16000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
          enableWordTimeOffsets: true,
        },
      };
      
      const [response] = await client.recognize(request);
      const transcription = response.results
        ?.map(result => result.alternatives?.[0]?.transcript)
        .join('\n') || '';
      
      return transcription;
    } catch (error) {
      console.error('Audio processing error:', error);
      return 'Unable to process audio content.';
    }
  }

  // Generate Audio Response
  private async generateAudioResponse(text: string): Promise<string> {
    try {
      const client = new textToSpeech.TextToSpeechClient();
      
      const request = {
        input: { text },
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' as const },
        audioConfig: { audioEncoding: 'MP3' as const },
      };
      
      const [response] = await client.synthesizeSpeech(request);
      return response.audioContent?.toString('base64') || '';
    } catch (error) {
      console.error('Audio generation error:', error);
      return '';
    }
  }

  // Math Content Analysis
  private async analyzeMathContent(text: string): Promise<string> {
    const mathPatterns = [
      /\d+\s*[\+\-\*\/]\s*\d+/g, // Basic arithmetic
      /[a-z]\s*=\s*[^=]+/g, // Equations
      /\b(sin|cos|tan|log|ln|sqrt)\s*\([^)]+\)/g, // Functions
      /\b\d*[a-z]\^?\d*/g, // Variables with coefficients
    ];
    
    const foundMath = mathPatterns.some(pattern => pattern.test(text));
    
    if (foundMath) {
      // Send to specialized math solver
      const mathPrompt = `Solve and explain step by step: ${text}`;
      return await this.callAzureOpenAI(mathPrompt);
    }
    
    return 'No mathematical content detected.';
  }

  // Visual Content Analysis using Azure Computer Vision
  private async analyzeImageContent(imageBase64: string): Promise<string> {
    try {
      const endpoint = process.env.AZURE_COMPUTER_VISION_ENDPOINT;
      const apiKey = process.env.AZURE_COMPUTER_VISION_KEY;
      
      if (!endpoint || !apiKey) {
        return 'Computer vision not configured.';
      }
      
      const response = await axios.post(
        `${endpoint}/vision/v3.2/analyze?visualFeatures=Categories,Description,Objects,Tags`,
        { url: `data:image/jpeg;base64,${imageBase64}` },
        {
          headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const analysis = response.data;
      return `Description: ${analysis.description?.captions?.[0]?.text || 'No description available'}
Objects: ${analysis.objects?.map((obj: any) => obj.object).join(', ') || 'None detected'}
Tags: ${analysis.tags?.map((tag: any) => tag.name).join(', ') || 'None detected'}`;
    } catch (error) {
      console.error('Visual analysis error:', error);
      return 'Unable to analyze visual content.';
    }
  }

  // Mental Health & Motivation
  async motivation(
    studentId: string,
    mood?: string,
    contextText?: string,
  ): Promise<{ message: string }> {
    const { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) throw error;

    const preferences = context?.flashcard_preferences || [];

    const prompt = [
      'You are an AI coach for student mental health and motivation.',
      mood ? `Student mood: ${mood}` : '',
      contextText ? `Context: ${contextText}` : '',
      `Student preferences: ${preferences.join(', ')}`,
      'Provide encouragement, stress management tips, and a supportive check-in message.'
    ].filter(Boolean).join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);
    return { message: aiResponse };
  }

  // ==================== NEW STUDENT LIFE FEATURES ====================

  // Smart Calendar Integration & Study Scheduling
  async generateStudySchedule(
    studentId: string,
    courses: { id: string; name: string; credits: number; difficulty: string }[],
    assignments: { id: string; name: string; dueDate: string; estimatedHours: number; priority: string }[],
    exams: { id: string; name: string; date: string; weight: number }[],
    preferences: {
      studyHoursPerDay?: number;
      preferredStudyTimes?: string[];
      breakDuration?: number;
      weekendStudy?: boolean;
    } = {},
  ): Promise<{
    schedule: {
      date: string;
      tasks: {
        time: string;
        duration: number;
        type: 'study' | 'assignment' | 'exam_prep' | 'break' | 'review';
        subject: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
      }[];
    }[];
    recommendations: string[];
  }> {
    const { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) throw error;

    const history = context?.conversation_history || [];
    
    // Analyze student's learning patterns from history
    const learningPatterns = await this.analyzeLearningPatterns(history);
    
    const prompt = [
      'You are an AI study scheduler that creates optimal study plans.',
      `Courses: ${JSON.stringify(courses)}`,
      `Assignments: ${JSON.stringify(assignments)}`,
      `Exams: ${JSON.stringify(exams)}`,
      `Preferences: ${JSON.stringify(preferences)}`,
      `Learning Patterns: ${learningPatterns}`,
      'Create a detailed 2-week study schedule with specific time blocks, considering:',
      '1. Assignment deadlines and exam dates',
      '2. Course difficulty and credit hours',
      '3. Student preferences and optimal study times',
      '4. Spaced repetition for better retention',
      '5. Regular breaks and review sessions',
      'Format as JSON with dates, times, and task details.'
    ].join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);
    
    try {
      const scheduleData = JSON.parse(aiResponse);
      return scheduleData;
    } catch {
      // Fallback if JSON parsing fails
      return {
        schedule: [],
        recommendations: [aiResponse]
      };
    }
  }

  // Expense Tracking for Student Budgets
  async trackExpenses(
    studentId: string,
    expenses: {
      category: 'textbooks' | 'supplies' | 'food' | 'transport' | 'entertainment' | 'other';
      amount: number;
      description: string;
      date: string;
    }[],
    monthlyBudget?: number,
  ): Promise<{
    summary: {
      totalSpent: number;
      categoryBreakdown: Record<string, number>;
      budgetStatus: 'under' | 'on_track' | 'over';
      remainingBudget: number;
    };
    insights: string[];
    recommendations: string[];
  }> {
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const budgetStatus = monthlyBudget 
      ? totalSpent < monthlyBudget * 0.8 ? 'under' 
        : totalSpent <= monthlyBudget ? 'on_track' 
        : 'over'
      : 'on_track';

    const remainingBudget = monthlyBudget ? monthlyBudget - totalSpent : 0;

    const prompt = [
      'You are a financial advisor for students.',
      `Total spent: $${totalSpent}`,
      `Category breakdown: ${JSON.stringify(categoryBreakdown)}`,
      `Monthly budget: $${monthlyBudget || 'Not set'}`,
      `Budget status: ${budgetStatus}`,
      'Provide insights and money-saving recommendations for students.',
      'Focus on academic expenses, meal planning, and student discounts.'
    ].join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);
    const recommendations = aiResponse.split('\n').filter(line => line.trim());

    return {
      summary: {
        totalSpent,
        categoryBreakdown,
        budgetStatus,
        remainingBudget,
      },
      insights: [
        `You've spent $${totalSpent} this month`,
        `Highest expense category: ${Object.entries(categoryBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'}`,
        budgetStatus === 'over' ? 'You are over budget!' : budgetStatus === 'under' ? 'Great job staying under budget!' : 'You are on track with your budget'
      ],
      recommendations,
    };
  }

  // Grade Prediction and GPA Calculator
  async predictGrades(
    studentId: string,
    courses: {
      id: string;
      name: string;
      currentGrade: number;
      assignments: { name: string; grade: number; weight: number; completed: boolean }[];
      exams: { name: string; grade?: number; weight: number; date: string }[];
      participation: number;
      attendance: number;
    }[],
  ): Promise<{
    predictions: {
      courseId: string;
      courseName: string;
      currentGPA: number;
      predictedFinalGrade: number;
      confidenceLevel: string;
      improvementTips: string[];
    }[];
    overallGPA: {
      current: number;
      predicted: number;
      targetGPA?: number;
      requiredGrades?: Record<string, number>;
    };
  }> {
    const { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();
    if (error) throw error;

    const predictions = courses.map(course => {
      // Calculate current weighted average
      const completedAssignments = course.assignments.filter(a => a.completed);
      const assignmentAvg = completedAssignments.length > 0 
        ? completedAssignments.reduce((sum, a) => sum + (a.grade * a.weight), 0) / 
          completedAssignments.reduce((sum, a) => sum + a.weight, 0)
        : 0;

      const completedExams = course.exams.filter(e => e.grade !== undefined);
      const examAvg = completedExams.length > 0
        ? completedExams.reduce((sum, e) => sum + (e.grade! * e.weight), 0) /
          completedExams.reduce((sum, e) => sum + e.weight, 0)
        : 0;

      // Simple prediction based on current performance
      const predictedFinalGrade = (assignmentAvg * 0.4) + (examAvg * 0.4) + 
                                 (course.participation * 0.1) + (course.attendance * 0.1);

      return {
        courseId: course.id,
        courseName: course.name,
        currentGPA: this.gradeToGPA(course.currentGrade),
        predictedFinalGrade,
        confidenceLevel: completedAssignments.length > 2 ? 'High' : 'Medium',
        improvementTips: [] as string[]
      };
    });

    const currentGPA = predictions.reduce((sum, p) => sum + p.currentGPA, 0) / predictions.length;
    const predictedGPA = predictions.reduce((sum, p) => sum + this.gradeToGPA(p.predictedFinalGrade), 0) / predictions.length;

    // Get AI recommendations for each course
    for (const prediction of predictions) {
      const course = courses.find(c => c.id === prediction.courseId);
      const prompt = [
        'You are an academic advisor analyzing student performance.',
        `Course: ${prediction.courseName}`,
        `Current grade: ${course?.currentGrade}%`,
        `Predicted final grade: ${prediction.predictedFinalGrade.toFixed(1)}%`,
        `Assignments completed: ${course?.assignments.filter(a => a.completed).length}/${course?.assignments.length}`,
        `Exams taken: ${course?.exams.filter(e => e.grade !== undefined).length}/${course?.exams.length}`,
        'Provide 3 specific improvement tips for this course.'
      ].join('\n');

      const tips = await this.callAzureOpenAI(prompt);
      prediction.improvementTips = tips.split('\n').filter(tip => tip.trim()).slice(0, 3);
    }

    return {
      predictions,
      overallGPA: {
        current: currentGPA,
        predicted: predictedGPA,
      },
    };
  }

  // Research Assistant for Citations and Sources
  async researchAssistant(
    studentId: string,
    topic: string,
    assignmentType: 'essay' | 'research_paper' | 'presentation' | 'thesis',
    requirements: {
      minSources?: number;
      citationStyle?: 'APA' | 'MLA' | 'Chicago' | 'Harvard';
      academicLevel?: 'undergraduate' | 'graduate' | 'doctoral';
      pageLength?: number;
    } = {},
  ): Promise<{
    outline: {
      title: string;
      sections: { heading: string; keyPoints: string[]; suggestedSources: number }[];
    };
    sources: {
      title: string;
      authors: string[];
      year: number;
      type: 'journal' | 'book' | 'website' | 'conference';
      url?: string;
      citation: string;
      relevance: string;
    }[];
    writingTips: string[];
    timeline: {
      phase: string;
      duration: string;
      tasks: string[];
    }[];
  }> {
    const prompt = [
      'You are a research assistant helping students with academic assignments.',
      `Topic: ${topic}`,
      `Assignment type: ${assignmentType}`,
      `Requirements: ${JSON.stringify(requirements)}`,
      'Your job is to provide a comprehensive, student-friendly research plan. Your response must be detailed, actionable, and easy to follow for a university student.',
      'Respond ONLY in the following JSON format, with no extra text, make each part as detailed as possible:',
      `{
  "outline": {
    "title": "Research on climate change",
    "sections": [
      {
        "heading": "Introduction to Climate Change",
        "keyPoints": [
          "Definition and scope of climate change",
          "Historical context and major events",
          "Importance of studying climate change"
        ],
        "suggestedSources": 2
      },
      {
        "heading": "Causes of Climate Change",
        "keyPoints": [
          "Greenhouse gas emissions",
          "Deforestation and land use",
          "Industrialization and human activity"
        ],
        "suggestedSources": 2
      },
      {
        "heading": "Impacts of Climate Change",
        "keyPoints": [
          "Rising sea levels and extreme weather",
          "Effects on biodiversity and ecosystems",
          "Socioeconomic consequences"
        ],
        "suggestedSources": 2
      },
      {
        "heading": "Mitigation and Adaptation Strategies",
        "keyPoints": [
          "Renewable energy solutions",
          "Policy and international agreements",
          "Community and individual actions"
        ],
        "suggestedSources": 2
      },
      {
        "heading": "Conclusion and Future Directions",
        "keyPoints": [
          "Summary of key findings",
          "Ongoing research and challenges",
          "Call to action for further study"
        ],
        "suggestedSources": 1
      }
    ]
  },
  "sources": [
    {
      "title": "Climate Change 2022: Impacts, Adaptation and Vulnerability",
      "authors": ["IPCC Working Group II"],
      "year": 2022,
      "type": "journal",
      "citation": "IPCC Working Group II. (2022). Climate Change 2022: Impacts, Adaptation and Vulnerability. Cambridge University Press.",
      "relevance": "Comprehensive review of climate change impacts and adaptation strategies."
    },
    {
      "title": "The Discovery of Global Warming",
      "authors": ["Spencer Weart"],
      "year": 2008,
      "type": "book",
      "citation": "Weart, S. (2008). The Discovery of Global Warming. Harvard University Press.",
      "relevance": "Historical perspective on climate science."
    },
    {
      "title": "Renewable Energy Solutions for Climate Change",
      "authors": ["Jane Doe"],
      "year": 2021,
      "type": "journal",
      "citation": "Doe, J. (2021). Renewable Energy Solutions for Climate Change. Energy Policy Journal, 45(2), 123-145.",
      "relevance": "Focuses on mitigation strategies."
    }
  ],
  "writingTips": [
    "Start each section with a clear topic sentence.",
    "Use real-world examples to illustrate key points.",
    "Cite all sources using APA style.",
    "Break down complex ideas into simple language.",
    "Conclude with a summary and recommendations for further research."
  ],
  "timeline": [
    {
      "phase": "Research Phase",
      "duration": "3-5 days",
      "tasks": [
        "Conduct literature review",
        "Collect and organize sources",
        "Take detailed notes"
      ]
    },
    {
      "phase": "Planning Phase",
      "duration": "1-2 days",
      "tasks": [
        "Draft outline",
        "Map sources to outline sections",
        "Plan writing schedule"
      ]
    },
    {
      "phase": "Writing Phase",
      "duration": "5-7 days",
      "tasks": [
        "Write first draft section by section",
        "Integrate citations and examples",
        "Revise for clarity and flow"
      ]
    },
    {
      "phase": "Final Phase",
      "duration": "2-3 days",
      "tasks": [
        "Proofread and edit",
        "Format citations and references",
        "Submit final paper"
      ]
    }
  ]
}`,
      'Requirements:',
      '- The outline must have at least 4-5 sections, each with 3+ key points.',
      '- Provide at least 3 diverse, realistic sources with full citations.',
      '- Give 5 or more actionable, student-friendly writing tips.',
      '- Timeline should be broken into clear phases with actionable tasks.',
      '- Write in a clear, supportive, student-friendly tone.',
      `Format all citations in ${requirements.citationStyle || 'APA'} style.`,
      'Do NOT include any explanation or extra text outside the JSON.'
    ].join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);

    // Try to parse as JSON
    let parsed: any = null;
    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      // Fallback: try to extract JSON block from the response
      const match = aiResponse.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {}
      }
    }

    if (parsed && parsed.outline && parsed.sources && parsed.writingTips && parsed.timeline) {
      // Validate and sanitize
      return {
        outline: {
          title: parsed.outline.title || `Research on ${topic}`,
          sections: Array.isArray(parsed.outline.sections)
            ? parsed.outline.sections.map((s: any) => ({
                heading: s.heading || '',
                keyPoints: Array.isArray(s.keyPoints) ? s.keyPoints : [],
                suggestedSources: typeof s.suggestedSources === 'number' ? s.suggestedSources : 3,
              }))
            : [],
        },
        sources: Array.isArray(parsed.sources)
          ? parsed.sources.map((src: any) => ({
              title: src.title || '',
              authors: Array.isArray(src.authors) ? src.authors : [],
              year: typeof src.year === 'number' ? src.year : 2023,
              type: src.type || 'journal',
              url: src.url,
              citation: src.citation || '',
              relevance: src.relevance || '',
            }))
          : [],
        writingTips: Array.isArray(parsed.writingTips) ? parsed.writingTips : [],
        timeline: Array.isArray(parsed.timeline)
          ? parsed.timeline.map((t: any) => ({
              phase: t.phase || '',
              duration: t.duration || '',
              tasks: Array.isArray(t.tasks) ? t.tasks : [],
            }))
          : [],
      };
    }

    // Fallback: old logic if parsing fails
    const sections = aiResponse.split('\n').filter(line => line.includes('Section') || line.includes('Chapter'));
    return {
      outline: {
        title: `Research on ${topic}`,
        sections: sections.slice(0, 5).map((section, index) => ({
          heading: section,
          keyPoints: [`Key point ${index + 1}`, `Key point ${index + 2}`, `Key point ${index + 3}`],
          suggestedSources: 3,
        })),
      },
      sources: [
        {
          title: `Academic Study on ${topic}`,
          authors: ['Smith, J.', 'Johnson, M.'],
          year: 2023,
          type: 'journal',
          citation: `Smith, J., & Johnson, M. (2023). Academic Study on ${topic}. Journal of Research, 15(3), 45-67.`,
          relevance: 'Highly relevant to your research topic',
        },
      ],
      writingTips: aiResponse.split('\n').filter(line => line.includes('tip') || line.includes('Tip')).slice(0, 5),
      timeline: [
        { phase: 'Research Phase', duration: '3-5 days', tasks: ['Literature review', 'Source collection', 'Note taking'] },
        { phase: 'Planning Phase', duration: '1-2 days', tasks: ['Create outline', 'Organize sources', 'Plan structure'] },
        { phase: 'Writing Phase', duration: '5-7 days', tasks: ['First draft', 'Revisions', 'Citations'] },
        { phase: 'Final Phase', duration: '2-3 days', tasks: ['Proofreading', 'Formatting', 'Final review'] },
      ],
    };
  }

  // Lecture Note Organizer and Enhancer
  async enhanceLectureNotes(
    studentId: string,
    rawNotes: string,
    courseInfo: {
      name: string;
      topic: string;
      date: string;
      professor?: string;
    },
  ): Promise<{
    enhancedNotes: {
      summary: string;
      keyPoints: string[];
      definitions: { term: string; definition: string }[];
      examples: string[];
      questions: string[];
    };
    studyMaterials: {
      flashcards: { question: string; answer: string }[];
      practiceQuestions: string[];
      connections: string[];
    };
  }> {
    const prompt = [
      'You are an AI note-taking assistant that enhances student lecture notes.',
      `Course: ${courseInfo.name}`,
      `Topic: ${courseInfo.topic}`,
      `Date: ${courseInfo.date}`,
      'Raw notes:',
      rawNotes,
      'Enhance these notes by:',
      '1. Creating a clear summary',
      '2. Extracting key points',
      '3. Defining important terms',
      '4. Providing examples',
      '5. Generating study questions',
      '6. Creating flashcards',
      '7. Suggesting connections to other topics'
    ].join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);
    
    // Generate flashcards using existing method
    const flashcards = await this.getFlashcards(studentId, rawNotes, undefined, undefined, courseInfo.topic);

    return {
      enhancedNotes: {
        summary: aiResponse.split('\n')[0] || 'Summary not available',
        keyPoints: aiResponse.split('\n').filter(line => line.includes('•') || line.includes('-')).slice(0, 5),
        definitions: [
          { term: 'Sample Term', definition: 'Sample definition from notes' }
        ],
        examples: aiResponse.split('\n').filter(line => line.toLowerCase().includes('example')).slice(0, 3),
        questions: aiResponse.split('\n').filter(line => line.includes('?')).slice(0, 5),
      },
      studyMaterials: {
        flashcards,
        practiceQuestions: aiResponse.split('\n').filter(line => line.includes('?')).slice(0, 5),
        connections: ['Connection to previous lecture', 'Related to upcoming topic'],
      },
    };
  }

  // Study Group Matcher and Organizer
  async findStudyPartners(
    studentId: string,
    preferences: {
      courses: string[];
      studyStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
      availability: string[];
      location: 'online' | 'campus' | 'library' | 'flexible';
      groupSize: 'small' | 'medium' | 'large';
    },
  ): Promise<{
    matches: {
      studentId: string;
      name: string;
      commonCourses: string[];
      compatibility: number;
      studyStyle: string;
      availability: string[];
    }[];
    groupSuggestions: {
      topic: string;
      members: string[];
      meetingTime: string;
      location: string;
      agenda: string[];
    }[];
  }> {
    // In a real implementation, this would query the database for other students
    // For now, we'll simulate with AI-generated suggestions
    
    const prompt = [
      'You are an AI that helps students find compatible study partners.',
      `Student preferences: ${JSON.stringify(preferences)}`,
      'Suggest study group formations and meeting strategies.',
      'Consider learning styles, course overlap, and scheduling compatibility.'
    ].join('\n');

    const aiResponse = await this.callAzureOpenAI(prompt);

    return {
      matches: [
        {
          studentId: 'student_123',
          name: 'Study Partner 1',
          commonCourses: preferences.courses.slice(0, 2),
          compatibility: 85,
          studyStyle: preferences.studyStyle,
          availability: preferences.availability,
        },
      ],
      groupSuggestions: [
        {
          topic: preferences.courses[0] || 'General Study',
          members: ['You', 'Partner 1', 'Partner 2'],
          meetingTime: preferences.availability[0] || 'TBD',
          location: preferences.location,
          agenda: ['Review notes', 'Practice problems', 'Q&A session'],
        },
      ],
    };
  }

  // ==================== HELPER METHODS ====================

  // Explain a quiz question and answer
  async explainQuizQuestion(
    studentId: string,
    question: string,
    answer: string
  ): Promise<string> {
    // Optionally, fetch student preferences/context for more personalized explanations
    const { data: context, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .single();
    const preferences = context?.flashcard_preferences || [];

    const prompt = [
      'You are a helpful AI tutor. Explain the following quiz question and its answer in a clear, student-friendly way. Include reasoning and, if relevant, examples or analogies.',
      `Student preferences: ${preferences.join(', ')}`,
      `Question: ${question}`,
      `Answer: ${answer}`,
      'Explanation:'
    ].join('\n');

    return await this.callAzureOpenAI(prompt);
  }

  private async analyzeLearningPatterns(history: string[]): Promise<string> {
    if (history.length === 0) return 'No learning history available';
    
    const prompt = [
      'Analyze this student\'s learning patterns from their conversation history:',
      ...history.slice(-20),
      'Identify: preferred study times, learning style, strengths, and areas for improvement.'
    ].join('\n');

    return await this.callAzureOpenAI(prompt);
  }

  private gradeToGPA(grade: number): number {
    if (grade >= 97) return 4.0;
    if (grade >= 93) return 3.7;
    if (grade >= 90) return 3.3;
    if (grade >= 87) return 3.0;
    if (grade >= 83) return 2.7;
    if (grade >= 80) return 2.3;
    if (grade >= 77) return 2.0;
    if (grade >= 73) return 1.7;
    if (grade >= 70) return 1.3;
    if (grade >= 67) return 1.0;
    return 0.0;
  }
}
