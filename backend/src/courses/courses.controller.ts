import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './courses.schema';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../users/users.schema';

@Controller('courses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(): Promise<Course[]> {
    return this.coursesService.findAll();
  }

  @Post()
  @Roles(UserRole.Admin)
  async create(@Body() body: any, @Request() req): Promise<Course> {
    return this.coursesService.create(body);
  }

  @Put(':id')
  @Roles(UserRole.Admin)
  async update(@Param('id') id: string, @Body() body: any): Promise<Course | null> {
    return this.coursesService.update(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  async remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    await this.coursesService.remove(id);
    return { deleted: true };
  }
}
