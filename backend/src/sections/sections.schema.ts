import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SectionDocument = Section & Document;

@Schema({ timestamps: true })
export class Section {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  order: number;

  // Reference to parent course
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  course: Types.ObjectId;

  // Array of lesson IDs (to be defined in lessons.schema.ts)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Lesson' }], default: [] })
  lessons: Types.ObjectId[];
}

export const SectionSchema = SchemaFactory.createForClass(Section);
