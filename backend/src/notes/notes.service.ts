import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SupabaseClient } from '@supabase/supabase-js';
import { getMimeType } from './mime-types';

@Injectable()
export class NotesService {
  constructor(
    @Inject('SUPABASE_ADMIN_CLIENT')
    private readonly supabase: SupabaseClient
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

  async uploadNote(userId: string, name: string, file: Express.Multer.File, contentType?: string) {
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
        })
      );
      // Construct public URL (assuming public bucket)
      const url = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
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
}
