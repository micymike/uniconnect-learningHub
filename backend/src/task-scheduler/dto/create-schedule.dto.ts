import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  userInput: string;

  @IsOptional()
  @IsObject()
  preferences?: {
    startTime?: string;
    endTime?: string;
    breakDuration?: number;
    priorityTasks?: string[];
  };
}