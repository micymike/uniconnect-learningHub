import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StudentAIContextDocument = StudentAIContext & Document;

@Schema({ timestamps: true })
export class StudentAIContext {
  @Prop({ type: Types.ObjectId, required: true, unique: true, ref: 'User' })
  studentId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  conversationHistory: string[]; // Stores serialized Q&A or message objects

  @Prop({ type: [String], default: [] })
  flashcardPreferences: string[]; // Topics or tags for flashcard generation

  @Prop({ type: Object, default: {} })
  personalization: Record<string, any>; // Any additional personalization data
}

export const StudentAIContextSchema = SchemaFactory.createForClass(StudentAIContext);
