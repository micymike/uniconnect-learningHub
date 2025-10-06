import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import axios from 'axios';
import { Express } from 'express';

/**
 * Fetch a summary from Wikipedia for a given query.
 * Returns null if not found or error.
 */
async function fetchWikipediaSummary(query: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const res = await axios.get(url, { timeout: 4000 });
    if (res.data && res.data.extract) {
      return res.data.extract;
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Search DuckDuckGo for recent information (free alternative to Google Search API)
 */
async function searchDuckDuckGo(query: string): Promise<string | null> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await axios.get(url, { timeout: 5000 });
    if (res.data && res.data.Abstract) {
      return res.data.Abstract;
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Fetch recent news from NewsAPI (free tier: 1000 requests/month)
 */
async function fetchRecentNews(query: string): Promise<string | null> {
  try {
    // Using free tier - no API key needed for basic searches
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=3&language=en`;
    const res = await axios.get(url, { 
      timeout: 5000,
      headers: {
        'X-API-Key': process.env.NEWS_API_KEY || 'demo' // Use demo for testing
      }
    });
    if (res.data && res.data.articles && res.data.articles.length > 0) {
      const articles = res.data.articles.slice(0, 2);
      return articles.map((article: any) => 
        `${article.title} - ${article.description} (${article.publishedAt.split('T')[0]})`
      ).join('\n');
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Search academic papers using arXiv API (completely free)
 */
async function searchArxiv(query: string): Promise<string | null> {
  try {
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=2`;
    const res = await axios.get(url, { timeout: 5000 });
    if (res.data && res.data.includes('<entry>')) {
      // Basic XML parsing for titles and summaries
      const titleMatch = res.data.match(/<title>([^<]+)<\/title>/g);
      const summaryMatch = res.data.match(/<summary>([^<]+)<\/summary>/g);
      if (titleMatch && summaryMatch && titleMatch.length > 1) {
        return `Recent research: ${titleMatch[1].replace(/<\/?title>/g, '')} - ${summaryMatch[0].replace(/<\/?summary>/g, '').substring(0, 200)}...`;
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Get real-time data by combining multiple free sources
 */
async function getRealtimeInfo(query: string): Promise<string | null> {
  const searches = [
    fetchWikipediaSummary(query),
    searchDuckDuckGo(query),
    fetchRecentNews(query),
    searchArxiv(query)
  ];
  
  const results = await Promise.allSettled(searches);
  const validResults = results
    .filter(result => result.status === 'fulfilled' && result.value)
    .map(result => (result as PromiseFulfilledResult<string>).value);
  
  if (validResults.length > 0) {
    return validResults.join('\n\n');
  }
  return null;
}

/**
 * Fetch search results from LangSearch API (open-source web search for LLMs)
 */
async function fetchLangSearchResults(query: string): Promise<string | null> {
  try {
    // Change this endpoint to your LangSearch instance or a public endpoint
    const endpoint = process.env.LANGSEARCH_API_URL || "http://localhost:8080/search";
    const res = await axios.get(endpoint, {
      params: { q: query, n: 3 }, // n: number of results
      timeout: 5000
    });
    if (res.data && Array.isArray(res.data.results) && res.data.results.length > 0) {
      // Format top results as context
      return res.data.results.map((r: any, i: number) =>
        `[${i + 1}] ${r.title}\n${r.snippet}\n${r.url}`
      ).join('\n\n');
    }
    return null;
  } catch (err) {
    return null;
  }
}

@Injectable()
export class AIService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private supabase: SupabaseClient<Database>,
  ) {}

  /**
   * Study Buddy with Agents: Each agent brings its own answer, merged for a richer response.
   */
  async studyBuddyAgentsChat(
    studentId: string,
    message: string,
    context?: any
  ): Promise<string> {
    // Define agent personas
    const agents = [
      {
        name: "Explainer",
        systemPrompt: "You are Study Buddy the Explainer. Your job is to explain the student's question in detail, breaking down concepts step by step in a friendly, clear way. Use analogies and simple language."
      },
      {
        name: "Summarizer",
        systemPrompt: "You are Study Buddy the Summarizer. Your job is to provide a concise summary or key points related to the student's question, focusing on the most important facts."
      },
      {
        name: "Example Giver",
        systemPrompt: "You are Study Buddy the Example Giver. Your job is to provide practical examples, sample problems, or real-world applications to help the student understand the topic."
      },
      {
        name: "Quizzer",
        systemPrompt: "You are Study Buddy the Quizzer. Your job is to ask the student 1-2 quiz questions or practice problems related to their question, and provide the correct answers after each."
      }
    ];

    // Optionally, add context to each agent's system prompt
    let contextString = "";
    if (context && typeof context === "object") {
      if (context.notes && Array.isArray(context.notes) && context.notes.length > 0) {
        contextString += `\nThe student has these notes: ${context.notes.join(" | ")}.`;
      }
      if (context.quizResults && Array.isArray(context.quizResults) && context.quizResults.length > 0) {
        contextString += `\nRecent quiz results: ${JSON.stringify(context.quizResults)}.`;
      }
      if (context.learningPath && Array.isArray(context.learningPath) && context.learningPath.length > 0) {
        contextString += `\nCurrent learning path: ${context.learningPath.map((lp: any) => lp.title).join(", ")}.`;
      }
    }

    // Call each agent in parallel
    const agentPromises = agents.map(async (agent) => {
      const prompt = [
        agent.systemPrompt + contextString,
        `Student's question: ${message}`,
        "Your answer:"
      ].join("\n");
      try {
        const answer = await this.callAzureOpenAI(prompt);
        return `**${agent.name}:**\n${answer}`;
      } catch (err) {
        return `**${agent.name}:**\n(Sorry, I couldn't generate an answer this time.)`;
      }
    });

    const agentAnswers = await Promise.all(agentPromises);

    // Merge all agent answers into a single, student-friendly response using the LLM
    const mergePrompt = [
      "You are Study Buddy, a helpful AI for students.",
      "Below are answers from different expert agents (Explainer, Summarizer, Example Giver, Quizzer) to the same student question.",
      "Your job is to merge all the information and advice from these agents into a single, concise, student-friendly response. Do not mention the agent names or separate sections. Write as one unified answer, focusing on clarity, encouragement, and practical help.",
      "",
      "Agent answers:",
      agentAnswers.join("\n\n"),
      "",
      "Merged answer:"
    ].join("\n");

    const mergedAnswer = await this.callAzureOpenAI(mergePrompt);
    return mergedAnswer;
  }

  // Study Buddy Chatbot (memory-enabled, friendly)
  async studyBuddyChat(
    studentId: string,
    message: string,
    image?: Express.Multer.File,
    context?: any
  ): Promise<string> {
    // Retrieve or create student context
    let { data: dbContext, error } = await this.supabase
      .from('student_ai_context')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!dbContext) {
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
      dbContext = newContext;
    }

    // Prepare conversation history for context (limit to last 10 exchanges)
    const history = (dbContext.conversation_history || []).slice(-10);
    // Build a context-aware system prompt
    let systemPrompt = "You are Study Buddy, a friendly, supportive AI chat companion for students. Your personality adapts to the user's vibe: be casual, encouraging, and relatable if the user is informal, and more professional if the user is formal. Always be helpful, positive, and make the student feel comfortable. Use emojis and friendly language when appropriate. Remember the conversation and respond like a smart, caring friend.";
    // Add proactive context if provided
    if (context && typeof context === "object") {
      if (context.notes && Array.isArray(context.notes) && context.notes.length > 0) {
        systemPrompt += `\nThe student has the following recent notes: ${context.notes.join(" | ")}.`;
      }
      if (context.quizResults && Array.isArray(context.quizResults) && context.quizResults.length > 0) {
        systemPrompt += `\nRecent quiz results: ${JSON.stringify(context.quizResults)}.`;
      }
      if (context.learningPath && Array.isArray(context.learningPath) && context.learningPath.length > 0) {
        systemPrompt += `\nTheir current learning path: ${context.learningPath.map((lp: any) => lp.title).join(", ")}.`;
      }
      systemPrompt += "\nIf you notice weak areas, proactively suggest review, quizzes, or flashcards. If the student is making progress, offer encouragement and next steps.";
    }

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
            max_tokens: 2048
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
      // Text-only fallback with enhanced real-time search and LangSearch
      let searchContext: string | null = null;
      if (typeof message === "string" && message.length > 5) {
        const generalQ = /^(who|what|when|where|why|how|explain|define|tell me about|summarize|give me a summary of|latest|recent|current|news about|update on)\b/i;
        const currentQ = /\b(latest|recent|current|today|2024|2023|now|update|news)\b/i;
        
        if (generalQ.test(message.trim()) || currentQ.test(message.trim())) {
          // Extract the main topic
          let topic = message.replace(generalQ, "").replace(/[\?\.\!]+$/, "").trim();
          if (topic.length < 3) topic = message.trim();
          
          // Try LangSearch first
          searchContext = await fetchLangSearchResults(topic);
          // Fallback to other sources if LangSearch fails
          if (!searchContext) {
            if (currentQ.test(message.trim())) {
              searchContext = await getRealtimeInfo(topic);
            } else {
              searchContext = await fetchWikipediaSummary(topic);
            }
          }
        }
      }
      const promptParts = [
        systemPrompt,
        "Here is the conversation so far:",
        ...history,
        `Q: ${message}`,
        "A:"
      ];
      if (searchContext) {
        promptParts.splice(2, 0, `Web search results for context: ${searchContext}`);
      }
      const prompt = promptParts.join('\n');

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

  // Matching Game: Extract pairs for matching game
  async getMatchingPairs(
    userId: string,
    text: string,
    numPairs: number
  ): Promise<{ pairs: { term: string; definition: string }[] }> {
    // Prepare prompt for OpenAI
    const prompt = [
      "You are an AI that generates matching pairs for a study game. Given the following material, extract " +
        numPairs +
        " pairs of related terms and definitions (or Q/A). Respond ONLY with a valid JSON array: [{\"term\": \"\", \"definition\": \"\"}, ...] and nothing else.",
      "Material:",
      text,
    ].join("\n");

    let pairs: { term: string; definition: string }[] = [];
    try {
      const aiResponse = await this.callAzureOpenAI(prompt);
      // Try to parse JSON from response
      const match = aiResponse.match(/\[.*\]/s);
      if (match) {
        pairs = JSON.parse(match[0]);
      } else {
        throw new Error("AI response did not contain a valid JSON array.");
      }
    } catch (err) {
      throw new Error("Failed to generate matching pairs: " + (err as Error).message);
    }
    return { pairs };
  }

  // Dynamic Learning Path Generator
  async generateLearningPath(
    userId: string,
    performanceData: {
      quizResults: any[];
      notes: string[];
      completedLessons: string[];
    }
  ): Promise<{ learningPath: { id: string; title: string; description: string }[] }> {
    // Prepare prompt for OpenAI
    const prompt = [
      "You are an AI educational advisor. Given the following student data, recommend a personalized learning path for maximum retention and improvement.",
      "Student Data:",
      `Quiz Results: ${JSON.stringify(performanceData.quizResults)}`,
      `Notes: ${performanceData.notes.join('\n')}`,
      `Completed Lessons: ${JSON.stringify(performanceData.completedLessons)}`,
      "Respond ONLY with a valid JSON array: [{\"id\": \"lesson_or_topic_id\", \"title\": \"Lesson/Topic Title\", \"description\": \"Why this is recommended\"}, ...] and nothing else.",
    ].join("\n");

    let learningPath: { id: string; title: string; description: string }[] = [];
    try {
      const aiResponse = await this.callAzureOpenAI(prompt);
      const match = aiResponse.match(/\[.*\]/s);
      if (match) {
        learningPath = JSON.parse(match[0]);
      } else {
        throw new Error("AI response did not contain a valid JSON array.");
      }
    } catch (err) {
      throw new Error("Failed to generate learning path: " + (err as Error).message);
    }
    return { learningPath };
  }

  // Smart Quiz Generator
  async generateSmartQuiz(
    userId: string,
    notes: string[],
    quizHistory: any[],
    numQuestions: number = 5
  ): Promise<{ quiz: { question: string; options: string[]; answer: string; explanation?: string }[] }> {
    // Prepare prompt for OpenAI
    const prompt = [
      "You are an AI quiz generator. Given the student's notes and quiz history, generate a quiz targeting their weak areas.",
      "Student Notes:",
      notes.join('\n'),
      "Quiz History:",
      JSON.stringify(quizHistory),
      `Generate ${numQuestions} multiple-choice questions. Each question should have 4 options, the correct answer, and a brief explanation.`,
      "Respond ONLY with a valid JSON array: [{\"question\": \"\", \"options\": [\"\", \"\", \"\", \"\"], \"answer\": \"\", \"explanation\": \"\"}, ...] and nothing else."
    ].join("\n");

    let quiz: { question: string; options: string[]; answer: string; explanation?: string }[] = [];
    try {
      const aiResponse = await this.callAzureOpenAI(prompt);
      const match = aiResponse.match(/\[.*\]/s);
      if (match) {
        quiz = JSON.parse(match[0]);
      } else {
        throw new Error("AI response did not contain a valid JSON array.");
      }
    } catch (err) {
      throw new Error("Failed to generate smart quiz: " + (err as Error).message);
    }
    return { quiz };
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
        max_tokens: 2048,
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
