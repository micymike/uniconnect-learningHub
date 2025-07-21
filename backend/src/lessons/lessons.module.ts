import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson, LessonSchema } from './lessons.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }])],
  providers: [LessonsService],
  controllers: [LessonsController],
  exports: [LessonsService],
})
export class LessonsModule {}
