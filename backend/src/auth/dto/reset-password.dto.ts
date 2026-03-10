import { IsString, MinLength, IsOptional } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  access_token: string;

  @IsString()
  @MinLength(6)
  new_password: string;

  @IsString()
  @MinLength(6)
  confirm_password: string;

  @IsOptional()
  @IsString()
  refresh_token?: string;
}
