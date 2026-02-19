import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class EditMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class AddStudyMateDto {
  @IsString()
  @IsNotEmpty()
  studyMateId: string;
}

export class TypingDto {
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @IsOptional()
  isTyping?: boolean;
}