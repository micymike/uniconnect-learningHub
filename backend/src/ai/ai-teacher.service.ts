import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import axios from 'axios';

@Injectable()
export class AITeacherService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private supabase: SupabaseClient<Database>,
  ) {}

  async startTeachingSession(
    userId: string,
    topic?: string,
    pdfContent?: string
  ): Promise<{
    sessionId: string;
    introduction: string;
    blackboardContent: string;
  }> {
    // Create teaching session
    const { data: session, error } = await this.supabase
      .from('ai_teacher_sessions')
      .insert({
        user_id: userId,
        topic: topic || 'General Learning',
        pdf_content: pdfContent,
        conversation_history: [],
        blackboard_content: [],
        notes: []
      })
      .select('*')
      .single();

    if (error) throw error;

    // Generate introduction and initial blackboard content
    const systemPrompt = `You are an AI Teacher avatar. You are friendly, encouraging, and passionate about teaching. 
    ${topic ? `Today's topic is: ${topic}` : 'You are ready to teach any topic the student wants to learn about.'}
    ${pdfContent ? `You have access to this material: ${pdfContent.substring(0, 1000)}...` : ''}
    
    Start with a warm greeting and brief introduction to the topic. Be enthusiastic and make the student feel welcome.`;

    const introduction = await this.callAzureOpenAI(systemPrompt);

    // Generate initial blackboard content
    const blackboardPrompt = `Create a simple outline or key points for ${topic || 'the learning session'} that would appear on a blackboard. 
    Format as bullet points, keep it concise and visual. Maximum 5-6 points.
    ${pdfContent ? `Base this on the provided material.` : ''}`;

    const blackboardContent = await this.callAzureOpenAI(blackboardPrompt);

    // Update session with initial content
    await this.supabase
      .from('ai_teacher_sessions')
      .update({
        conversation_history: [`Teacher: ${introduction}`],
        blackboard_content: [blackboardContent]
      })
      .eq('id', session.id);

    return {
      sessionId: session.id,
      introduction,
      blackboardContent
    };
  }

  async continueTeaching(
    sessionId: string,
    userMessage: string,
    isInterruption: boolean = false
  ): Promise<{
    response: string;
    blackboardUpdate?: string;
    suggestedNotes?: string;
  }> {
    // Get session data
    const { data: session, error } = await this.supabase
      .from('ai_teacher_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    const history = session.conversation_history || [];
    const topic = session.topic;
    const pdfContent = session.pdf_content;

    // Handle interruption
    const interruptionContext = isInterruption 
      ? "The student has interrupted you with a question or comment. Acknowledge this politely and address their input before continuing."
      : "";

    const teachingPrompt = `You are an AI Teacher avatar teaching about ${topic}.
    ${pdfContent ? `You have this material to reference: ${pdfContent.substring(0, 1500)}...` : ''}
    ${interruptionContext}
    
    Conversation so far:
    ${history.slice(-6).join('\n')}
    
    Student says: ${userMessage}
    
    Respond as a friendly, encouraging teacher. Be conversational and engaging. If they ask questions, answer them clearly.
    If they seem confused, offer to explain differently. Keep responses focused and not too long.`;

    const response = await this.callAzureOpenAI(teachingPrompt);

    // Generate blackboard update if needed
    let blackboardUpdate;
    if (userMessage.toLowerCase().includes('explain') || userMessage.toLowerCase().includes('show') || userMessage.includes('?')) {
      const blackboardPrompt = `Based on this teaching conversation, create a brief blackboard note or diagram that would help explain the concept being discussed. 
      Keep it simple and visual. Topic: ${topic}
      Recent discussion: ${userMessage} - ${response.substring(0, 200)}`;
      
      blackboardUpdate = await this.callAzureOpenAI(blackboardPrompt);
    }

    // Generate suggested notes for student
    const notesPrompt = `Based on this teaching exchange, suggest 1-2 key points the student should write in their notes:
    Topic: ${topic}
    Discussion: ${userMessage} - ${response.substring(0, 200)}
    Format as brief bullet points.`;

    const suggestedNotes = await this.callAzureOpenAI(notesPrompt);

    // Update session
    const updatedHistory = [...history, `Student: ${userMessage}`, `Teacher: ${response}`];
    const updatedBlackboard = blackboardUpdate 
      ? [...(session.blackboard_content || []), blackboardUpdate]
      : session.blackboard_content;

    await this.supabase
      .from('ai_teacher_sessions')
      .update({
        conversation_history: updatedHistory.slice(-20), // Keep last 20 messages
        blackboard_content: updatedBlackboard
      })
      .eq('id', sessionId);

    return {
      response,
      blackboardUpdate,
      suggestedNotes
    };
  }

  async saveStudentNotes(
    sessionId: string,
    notes: string
  ): Promise<void> {
    const { data: session } = await this.supabase
      .from('ai_teacher_sessions')
      .select('notes')
      .eq('id', sessionId)
      .single();

    const existingNotes = session?.notes || [];
    const updatedNotes = [...existingNotes, {
      timestamp: new Date().toISOString(),
      content: notes
    }];

    await this.supabase
      .from('ai_teacher_sessions')
      .update({ notes: updatedNotes })
      .eq('id', sessionId);
  }

  async getSessionHistory(sessionId: string): Promise<{
    conversation: string[];
    blackboard: string[];
    notes: any[];
    topic: string;
  }> {
    const { data: session, error } = await this.supabase
      .from('ai_teacher_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    return {
      conversation: session.conversation_history || [],
      blackboard: session.blackboard_content || [],
      notes: session.notes || [],
      topic: session.topic
    };
  }

  async processPDF(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new Error('No PDF file provided');
    }

    const pdfParse = require('pdf-parse');
    const data = await pdfParse(file.buffer);
    return data.text;
  }

  private async callAzureOpenAI(prompt: string): Promise<string> {
    const base = process.env.AZURE_API_BASE!;
    const deployment = process.env.AZURE_API_MODEL!;
    const apiVersion = process.env.AZURE_API_VERSION!;
    const apiKey = process.env.AZURE_API_KEY!;

    const endpoint = `${base}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await axios.post(
      endpoint,
      {
        messages: [
          { role: 'system', content: 'You are a friendly, enthusiastic AI teacher. Be encouraging, clear, and engaging in your teaching style.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1024,
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