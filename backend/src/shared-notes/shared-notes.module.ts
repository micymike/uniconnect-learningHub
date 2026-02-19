import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { SharedNotesController } from './shared-notes.controller';
import { SharedNotesService } from './shared-notes.service';

@Module({
  imports: [SupabaseModule],
  controllers: [SharedNotesController],
  providers: [SharedNotesService],
  exports: [SharedNotesService],
})
export class SharedNotesModule {}