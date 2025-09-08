import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { MathGPTService } from './mathgpt.service';
import { AIController } from './ai.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [AIService, MathGPTService],
  controllers: [AIController],
  exports: [AIService, MathGPTService],
})
export class AIModule {}
