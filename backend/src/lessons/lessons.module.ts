import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    SupabaseModule, 
    ConfigModule,  
  ],
  providers: [LessonsService],
  controllers: [LessonsController],
  exports: [LessonsService], 
})
export class LessonsModule {}