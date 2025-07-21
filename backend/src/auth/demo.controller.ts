import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../users/users.schema';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller()
export class DemoController {
  @Get('admin/data')
  @Roles(UserRole.Admin)
  getAdminData(@Request() req) {
    return { message: 'Admin data', user: req.user };
  }

  @Get('student/data')
  @Roles(UserRole.Student)
  getStudentData(@Request() req) {
    return { message: 'Student data', user: req.user };
  }

  @Get('profile')
  getProfile(@Request() req) {
    return { message: 'Profile data', user: req.user };
  }
}
