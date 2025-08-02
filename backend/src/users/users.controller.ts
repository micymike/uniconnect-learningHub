import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/create-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'User already exists' 
  })
  async create(@Body() RegisterDto: RegisterDto) {
    try {
      const user = this.usersService.createUser(RegisterDto);
      
      return {
        statusCode: HttpStatus.CREATED,
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        }
      };
    } catch (error) {
      throw new HttpException({
        statusCode: error.status || HttpStatus.BAD_REQUEST,
        success: false,
        message: error.message || 'User creation failed'


      }, error.status || HttpStatus.BAD_REQUEST);
    }
  }
}







































































