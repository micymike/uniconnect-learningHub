import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../users/interfaces/user.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Demo')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('demo')
export class DemoController {
  @Get('admin/data')
  @Roles(UserRole.ADMIN)
  getAdminData(@Request() req) {
    return { 
      message: 'Admin data', 
      user: {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role
      }
    };
  }

  @Get('student/data')
  @Roles(UserRole.STUDENT)
  getStudentData(@Request() req) {
    return { 
      message: 'Student data', 
      user: {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role
      }
    };
  }

  @Get('profile')
  getProfile(@Request() req) {
    return { 
      message: 'Profile data', 
      user: {
        id: req.user.sub,
        email: req.user.email,
        role: req.user.role
      }
    };
  }
}