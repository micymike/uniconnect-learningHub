import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TranscriptionService {
  // Transcription is now handled client-side, this just processes the text
  async processTranscription(transcription: string): Promise<string> {
    // Just return the transcription as-is since it's already processed client-side
    return transcription;
  }

  async generateNotes(transcription: string): Promise<string> {
    try {
      const base = process.env.AZURE_API_BASE;
      const deployment = process.env.AZURE_API_MODEL;
      const apiVersion = process.env.AZURE_API_VERSION;
      const apiKey = process.env.AZURE_API_KEY;

      if (!base || !deployment || !apiVersion || !apiKey) {
        throw new Error('Azure OpenAI configuration missing');
      }

      const endpoint = `${base}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

      const response = await axios.post(
        endpoint,
        {
          messages: [
            {
              role: 'system',
              content: `You are an AI note-taking assistant. Convert the following transcription into well-structured, organized notes. Format them with:
- Clear headings and subheadings
- Bullet points for key concepts
- Important information highlighted
- Logical flow and organization
- Remove filler words and repetitions
- Focus on educational content and key takeaways`
            },
            {
              role: 'user',
              content: transcription
            }
          ],
          max_tokens: 2000,
          temperature: 0.3,
        },
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0]?.message?.content || transcription;
    } catch (error) {
      console.error('Note generation error:', error);
      return transcription;
    }
  }
}