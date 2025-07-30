import { Module } from '@nestjs/common';
import { AnalyticsModule } from './analytics/analytics.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { SectionsModule } from './sections/sections.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { AuthModule } from './auth/auth.module';
import { AIModule } from './ai/ai.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI!),
    AnalyticsModule,
    UsersModule,
    CoursesModule,
    SectionsModule,
    LessonsModule,
    QuizzesModule,
    AuthModule,
    AIModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
