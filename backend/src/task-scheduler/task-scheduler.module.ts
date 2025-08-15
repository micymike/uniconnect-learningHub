import { Module } from '@nestjs/common';
import { TaskSchedulerService } from './task-scheduler.service';
import { TaskSchedulerController } from './task-scheduler.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [SupabaseModule, AIModule],
  providers: [TaskSchedulerService],
  controllers: [TaskSchedulerController],
  exports: [TaskSchedulerService],
})
export class TaskSchedulerModule {}