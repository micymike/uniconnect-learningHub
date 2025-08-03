import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { UsersModule } from './users/users.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CoursesModule } from './courses/courses.module';
import { SectionsModule } from './sections/sections.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { AuthModule } from './auth/auth.module';
import { AIModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '${process.cwd()}/.env' 
    }),
    SupabaseModule,
    UsersModule,
    AnalyticsModule,
    CoursesModule,
    SectionsModule,
    LessonsModule,
    QuizzesModule,
    AuthModule,
    AIModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
