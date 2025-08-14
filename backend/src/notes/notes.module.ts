import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
