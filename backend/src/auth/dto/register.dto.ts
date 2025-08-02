import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsIn(['student', 'admin'])
  role: string;

  @IsString()
  @IsOptional()
  fullName?: string;
}