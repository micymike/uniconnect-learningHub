import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  Student = 'student',
  Admin = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // Hashed

  @Prop({ required: true, enum: UserRole, default: UserRole.Student })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
