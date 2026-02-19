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

  // New: Send study partner request
  @UseGuards(JwtAuthGuard)
  @Post('request-partner')
  async requestStudyPartner(@Req() req, @Body('recipientId') recipientId: string) {
    const requesterId = req.user?.userId || req.user?.id;
    if (!requesterId || !recipientId) {
      throw new HttpException('Missing user or recipient id', HttpStatus.BAD_REQUEST);
    }
    const result = await this.usersService.createStudyPartnerRequest(requesterId, recipientId);
    return { success: true, request: result };
  }

  // New: List incoming study partner requests
  @UseGuards(JwtAuthGuard)
  @Get('partner-requests')
  async getPartnerRequests(@Req() req) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const requests = await this.usersService.getIncomingPartnerRequests(userId);
    return { requests };
  }

  // New: Respond to a study partner request (accept/decline)
  @UseGuards(JwtAuthGuard)
  @Post('respond-partner-request')
  async respondPartnerRequest(
    @Req() req,
    @Body('requestId') requestId: string,
    @Body('action') action: 'accept' | 'decline'
  ) {
    const userId = req.user?.userId || req.user?.id;
    if (!userId || !requestId || !action) {
      throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
    }
    const result = await this.usersService.respondToPartnerRequest(userId, requestId, action);
    return { success: true, result };
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
