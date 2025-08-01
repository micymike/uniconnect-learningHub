import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lessons.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/interfaces/user.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonsService.findOne(id);
  }

  @Get('section/:sectionId')
  async findBySection(@Param('sectionId', ParseUUIDPipe) sectionId: string) {
    return this.lessonsService.findBySection(sectionId);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto
  ) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.lessonsService.remove(id);
  }
}