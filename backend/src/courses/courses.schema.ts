import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ default: false })
  published: boolean;

  // Array of module IDs (to be defined in modules.schema.ts)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Module' }], default: [] })
  modules: Types.ObjectId[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
