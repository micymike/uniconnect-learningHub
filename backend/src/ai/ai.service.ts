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
    message: string,
    image?: Express.Multer.File
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
    const systemPrompt = "You are Study Buddy, a friendly, supportive AI chat companion for students. Your personality adapts to the user's vibe: be casual, encouraging, and relatable if the user is informal, and more professional if the user is formal. Always be helpful, positive, and make the student feel comfortable. Use emojis and friendly language when appropriate. Remember the conversation and respond like a smart, caring friend.";

    // If image is provided, use vision model payload
    if (image && image.buffer) {
      try {
        const base64Image = image.buffer.toString('base64');
        const base = process.env.AZURE_API_BASE;
        const deployment = process.env.AZURE_API_MODEL;
        const apiVersion = process.env.AZURE_API_VERSION;
        const apiKey = process.env.AZURE_API_KEY;
        if (!base || !deployment || !apiVersion || !apiKey) {
          throw new Error("Azure OpenAI API configuration is incomplete in environment variables.");
        }
        const endpoint = `${base}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
        const payload = {
          model: deployment,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: [ "Here is the conversation so far:", ...history, `Q: ${message}`, "A:" ].join('\n') },
                { type: "image_url", image_url: { url: `data:${image.mimetype};base64,${base64Image}` } }
              ]
            }
          ],
          max_tokens: 512
        };
        const headers = {
          "Content-Type": "application/json",
          "api-key": apiKey
        };
        try {
          const response = await axios.post(endpoint, payload, { headers });
          console.log("Azure OpenAI response for image:", response.data);
          const aiReply = response.data.choices?.[0]?.message?.content?.trim() || "No reply returned.";

          // Store the new Q&A in conversation history
          const updatedHistory = [...history, `Q: ${message}`, `A: ${aiReply}`].slice(-20);

          // Update context in Supabase
          const { error: updateError } = await this.supabase
            .from('student_ai_context')
            .update({ conversation_history: updatedHistory })
            .eq('student_id', studentId);

          if (updateError) throw updateError;

          return aiReply;
        } catch (err: any) {
          if (err.response) {
            console.error("Azure OpenAI error response:", err.response.data);
            return `Error from Azure OpenAI: ${JSON.stringify(err.response.data)}`;
          } else {
            console.error("Error processing image in studyBuddyChat:", err);
            return "Sorry, I couldn't process the image. Please make sure the image is valid and try again.";
          }
        }
      } catch (err) {
        console.error("Error processing image in studyBuddyChat (outer catch):", err);
        return "Sorry, I couldn't process the image. Please make sure the image is valid and try again.";
      }
    } else {
      // Text-only fallback
      const prompt = [
        systemPrompt,
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

  // Study Assistant: Answer questions about uploaded document, referencing source
  async studyAssist(
    userId: string,
    question: string,
    file?: any,
    pdfUrl?: string
  ): Promise<string> {
    let inputText = "";
    let sourceInfo = "";

    if (file) {
      const buffer = file.buffer || file;
      const originalName = file.originalname || file.name || "";
      if (originalName.endsWith(".pdf")) {
        const pdfParse = require("pdf-parse");
        const data = await pdfParse(buffer);
        inputText = data.text;
        sourceInfo = "PDF document";
      } else if (originalName.endsWith(".docx") || originalName.endsWith(".doc")) {
        const mammoth = require("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        inputText = result.value;
        sourceInfo = "Word document";
      } else if (originalName.endsWith(".txt")) {
        inputText = buffer.toString("utf-8");
        sourceInfo = "Text file";
      } else {
        throw new Error("Unsupported file type. Only PDF, DOCX, and TXT are supported.");
      }
    } else if (pdfUrl) {
      // Download PDF from remote URL
      const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data);
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      inputText = data.text;
      sourceInfo = `PDF document (downloaded from ${pdfUrl})`;
    } else {
      throw new Error("No file or pdfUrl provided.");
    }

    const prompt = [
      "You are an AI study assistant. Given the following document, answer the student's question.",
      "Always reference the source location in your answer (e.g., page number, section, or quote from the document).",
      "If possible, cite the exact phrase or paragraph you used to answer.",
      `Document Type: ${sourceInfo}`,
      "Document Content:",
      inputText,
      `Student Question: ${question}`,
      "Answer (with reference):"
    ].join("\n");

    const answer = await this.callAzureOpenAI(prompt);
    return answer;
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

  // AI checks if user's answer is correct for a flashcard
  async checkFlashcardAnswer(
    userId: string,
    question: string,
    answer: string,
    userAnswer: string
  ): Promise<{ correct: boolean, feedback?: string }> {
    const prompt = [
      "You are an AI tutor. Given a flashcard question, the correct answer, and a student's answer, judge if the student's answer is correct.",
      "If the answer is correct, reply with 'CORRECT'. If not, reply with 'INCORRECT' and a brief feedback message for the student.",
      `Question: ${question}`,
      `Correct Answer: ${answer}`,
      `Student's Answer: ${userAnswer}`,
      "Result:"
    ].join("\n");

    const aiResponse = await this.callAzureOpenAI(prompt);
    if (aiResponse.trim().toUpperCase().startsWith("CORRECT")) {
      return { correct: true };
    } else if (aiResponse.trim().toUpperCase().startsWith("INCORRECT")) {
      // Extract feedback after "INCORRECT"
      const feedback = aiResponse.replace(/INCORRECT[:\-]?\s*/i, "").trim();
      return { correct: false, feedback };
    } else {
      // Fallback: treat as incorrect with generic feedback
      return { correct: false, feedback: aiResponse.trim() };
    }
  }

  // Analyze Image (Vision Model)
  async analyzeImage(
    userId: string,
    image: Express.Multer.File,
    prompt?: string
  ): Promise<string> {
    if (!image || !image.buffer) {
      throw new Error("No image file provided.");
    }
    // Convert image buffer to base64
    const base64Image = image.buffer.toString('base64');
    // Prepare payload for vision model (e.g., Azure OpenAI, OpenAI GPT-4 Vision)
    // Use only the credentials and endpoint as defined in .env (do not change or add fallbacks)
    const base = process.env.AZURE_API_BASE;
    const deployment = process.env.AZURE_API_MODEL;
    const apiVersion = process.env.AZURE_API_VERSION;
    const apiKey = process.env.AZURE_API_KEY;
    
    if (!base || !deployment || !apiVersion || !apiKey) {
      throw new Error("Azure OpenAI API configuration is incomplete in environment variables.");
    }
    
    // Construct the proper endpoint like in callAzureOpenAI
    const endpoint = `${base}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
    // Use user prompt or fallback to default
    const userPrompt = prompt && prompt.trim().length > 0
      ? prompt.trim()
      : "Explain the content of this image for a student.";
    // Payload for GPT-4.1 image support (gpt-4-1106-preview or similar)
    const payload = {
      model: process.env.AZURE_API_MODEL,
      messages: [
        { role: "system", content: "You are Study Buddy, a friendly AI that explains images to students in simple, supportive language." },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            { type: "image_url", image_url: { url: `data:${image.mimetype};base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 512
    };
    const headers = {
      "Content-Type": "application/json",
      "api-key": apiKey
    };
    // Send request to vision model
    const response = await axios.post(endpoint, payload, { headers });
    const explanation = response.data.choices?.[0]?.message?.content?.trim() || "No explanation returned.";
    return explanation;
  }

  // Helper: Call Azure OpenAI API
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
