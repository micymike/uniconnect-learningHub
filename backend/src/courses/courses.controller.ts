import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/interfaces/user.interface';
import { CreateCourseDto, UpdateCourseDto } from './dto/courses.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('courses')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  async findAll() {
    return this.coursesService.findAll();
  }

  @Get('published')
  @ApiOperation({ summary: 'Get published courses' })
  @ApiResponse({ status: 200, description: 'List of published courses' })
  async findPublished() {
    return this.coursesService.findPublished();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured courses' })
  @ApiResponse({ status: 200, description: 'List of featured courses' })
  async findFeatured() {
    return this.coursesService.findFeatured();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get courses by category' })
  @ApiResponse({ status: 200, description: 'List of courses in category' })
  async findByCategory(@Param('category') category: string) {
    return this.coursesService.findByCategory(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course details' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a course' })
  @ApiResponse({ status: 201, description: 'Course created' })
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @Request() req
  ) {
    return this.coursesService.create(createCourseDto, req.user.id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 204, description: 'Course deleted' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req
  ) {
    await this.coursesService.remove(id, req.user);
  }
}
