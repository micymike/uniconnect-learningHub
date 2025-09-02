import { Controller, Post, Body, Get, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/create-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // List all users except the current user
  @UseGuards(JwtAuthGuard)
  @Get()
  async listAllUsers(@Req() req) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(req.query?.limit) || 20;
    const offset = (page - 1) * limit;
    const users = await this.usersService.listAllUsersExcept(userId, offset, limit);
    return { users, page, limit };
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-partner')
  async addStudyPartner(@Req() req, @Body('partnerId') partnerId: string) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId || !partnerId) {
      throw new HttpException('Missing user or partner id', HttpStatus.BAD_REQUEST);
    }
    const result = await this.usersService.addStudyPartner(userId, partnerId);
    return { success: true, studyPartner: result };
  }

  @UseGuards(JwtAuthGuard)
  @Get('study-partners')
  async getStudyPartners(@Req() req) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const partners = await this.usersService.getStudyPartners(userId);
    return { partners };
  }

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
