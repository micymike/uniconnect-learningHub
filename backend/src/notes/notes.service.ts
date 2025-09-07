import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SupabaseClient } from '@supabase/supabase-js';
import { getMimeType } from './mime-types';
import { TranscriptionService } from './transcription.service';

@Injectable()
export class NotesService {
  constructor(
    @Inject('SUPABASE_ADMIN_CLIENT')
    private readonly supabase: SupabaseClient,
    private readonly transcriptionService: TranscriptionService
  ) {}

  private s3 = new S3Client({
    region: process.env.CLOUDFLARE_R2_REGION || "auto",
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
  });

  private bucket = process.env.CLOUDFLARE_R2_BUCKET || process.env.CLOUDFLARE_BUCKET_NAME || "";

  async uploadNote(
    userId: string,
    name: string,
    file: Express.Multer.File,
    contentType?: string,
    folder?: string,
    tags?: string[],
    color_label?: string,
    icon?: string,
    file_type?: string,
    ocr_text?: string
  ) {
    try {
      // Upload file to Cloudflare R2
      const key = `${userId}/${Date.now()}_${file.originalname}`;
      const finalMimeType = contentType || file.mimetype || getMimeType(file.originalname);
      
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: finalMimeType,
          CacheControl: 'public, max-age=31536000',
          ContentDisposition: `inline; filename="${file.originalname}"`,
          Metadata: {
            'original-name': file.originalname,
            'upload-time': new Date().toISOString(),
          },
        })
      );
      // Use custom domain or R2 dev subdomain for public access
      const publicDomain = process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN || 
                          (() => {
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  if (!accessKeyId) throw new Error("CLOUDFLARE_R2_ACCESS_KEY_ID is not set");
  return `https://pub-${accessKeyId.substring(0, 8)}.r2.dev`;
})()
      const url = `${publicDomain}/${key}`;
      const uploadedAt = new Date().toISOString();

      // Insert note metadata into Supabase
      const { data, error } = await this.supabase
        .from('notes')
        .insert([
          {
            user_id: userId,
            name,
            url,
            uploaded_at: uploadedAt,
            folder: folder || null,
            tags: tags || [],
            color_label: color_label || null,
            icon: icon || null,
            file_type: file_type || file.mimetype || null,
            ocr_text: ocr_text || null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new InternalServerErrorException('Failed to save note metadata to Supabase');
      }

      return { success: true, note: data };
    } catch (err) {
      throw new InternalServerErrorException("Failed to upload to Cloudflare R2 or Supabase");
    }
  }

  async saveGeneratedNote(
    userId: string,
    noteName: string,
    content: string,
    timestamp: string
  ) {
    try {
      // Insert generated note as a text note in Supabase
      const { data, error } = await this.supabase
        .from('notes')
        .insert([
          {
            user_id: userId,
            name: noteName,
            url: null,
            uploaded_at: timestamp,
            folder: 'AI Generated',
            tags: ['ai-generated'],
            color_label: '#3B82F6', // blue
            icon: 'bx-brain',
            file_type: 'txt',
            ocr_text: content,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new InternalServerErrorException('Failed to save generated note to Supabase');
      }

      return { success: true, note: data };
    } catch (err) {
      throw new InternalServerErrorException("Failed to save generated note");
    }
  }
  async listNotes(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        // If the table doesn't exist yet, return an empty list instead of failing the request
        const code = (error as any)?.code;
        const message = (error as any)?.message || '';
        if (code === '42P01' || /relation .*notes.* does not exist/i.test(message)) {
          return { notes: [] };
        }
        throw error;
      }

      return { notes: data || [] };
    } catch (err: any) {
      console.error('Error in NotesService.listNotes:', err);
      throw new InternalServerErrorException(`Failed to fetch notes from Supabase: ${err?.message || err}`);
    }
  }

  async saveFlashcardScore(
    userId: string,
    score: number,
    bonus: number,
    numQuestions: number,
    timestamp: string
  ) {
    try {
      const { data, error } = await this.supabase
        .from('flashcard_scores')
        .insert([
          {
            user_id: userId,
            score,
            bonus,
            num_questions: numQuestions,
            timestamp,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new InternalServerErrorException('Failed to save flashcard score to Supabase');
      }

      return { success: true, id: data?.id };
    } catch (err) {
      throw new InternalServerErrorException("Failed to save flashcard score");
    }
  }

  async saveTranscribedNote(
    userId: string,
    transcription: string,
    noteName: string
  ) {
    try {
      // Generate structured notes using Azure AI
      const structuredNotes = await this.transcriptionService.generateNotes(transcription);

      // Create a text file with the notes
      const notesBuffer = Buffer.from(structuredNotes, 'utf-8');
      const textFile = {
        buffer: notesBuffer,
        originalname: `${noteName}.txt`,
        mimetype: 'text/plain'
      } as Express.Multer.File;

      // Save as regular note
      const result = await this.uploadNote(
        userId,
        noteName,
        textFile,
        'text/plain',
        'AI Generated',
        ['ai-generated', 'transcription'],
        '#10B981',
        'bx-microphone',
        'txt',
        transcription
      );

      return {
        ...result,
        transcription,
        structuredNotes
      };
    } catch (err) {
      console.error('Note processing error:', err);
      throw new InternalServerErrorException('Failed to process and save note');
    }
  }
}
