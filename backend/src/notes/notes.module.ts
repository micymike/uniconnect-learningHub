import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { TranscriptionService } from './transcription.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [NotesController],
  providers: [NotesService, TranscriptionService],
  exports: [NotesService],
})
export class NotesModule {}
