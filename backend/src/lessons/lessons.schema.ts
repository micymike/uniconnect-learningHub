import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LessonDocument = Lesson & Document;

@Schema({ timestamps: true })
export class Lesson {
  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop({ required: true })
  order: number;

  // Reference to parent section
  @Prop({ type: Types.ObjectId, ref: 'Section', required: true })
  section: Types.ObjectId;

  // Array of quiz IDs (to be defined in quizzes.schema.ts)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Quiz' }], default: [] })
  quizzes: Types.ObjectId[];
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
