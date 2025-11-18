import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { MathGPTService } from './mathgpt.service';
import { AITeacherService } from './ai-teacher.service';
import { AIController } from './ai.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [AIService, MathGPTService, AITeacherService],
  controllers: [AIController],
  exports: [AIService, MathGPTService, AITeacherService],
})
export class AIModule {}
