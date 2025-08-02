import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../interfaces/user.interface';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  created_at: string;
}