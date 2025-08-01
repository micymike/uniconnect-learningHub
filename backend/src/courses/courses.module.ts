import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    SupabaseModule, 
    ConfigModule,  
  ],
  providers: [CoursesService],
  controllers: [CoursesController],
  exports: [CoursesService], 
})
export class CoursesModule {}