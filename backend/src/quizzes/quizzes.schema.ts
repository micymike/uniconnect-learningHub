import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizDocument = Quiz & Document;

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true })
  title: string;

  // Reference to parent lesson
  @Prop({ type: Types.ObjectId, ref: 'Lesson', required: true })
  lesson: Types.ObjectId;

  // Array of questions (simple structure for MVP)
  @Prop({
    type: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        answer: { type: String, required: true },
      },
    ],
    default: [],
  })
  questions: {
    question: string;
    options: string[];
    answer: string;
  }[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
