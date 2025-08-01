import { Module } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    SupabaseModule,
    ConfigModule, 
  ],
  providers: [SectionsService],
  controllers: [SectionsController],
  exports: [SectionsService], 
})
export class SectionsModule {}