import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { StudentAIContext, StudentAIContextSchema } from './ai.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudentAIContext.name, schema: StudentAIContextSchema },
    ]),
  ],
  providers: [AIService],
  controllers: [AIController],
  exports: [AIService],
})
export class AIModule {}
