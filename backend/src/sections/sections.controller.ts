import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { Section } from './interfaces/section.interface';
import { CreateSectionDto, UpdateSectionDto } from './dto/sections.dto';

@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get()
  async findAllByCourse(@Query('courseId') courseId: string): Promise<Section[]> {
    return this.sectionsService.findAllByCourse(courseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Section> {
    return this.sectionsService.findOne(id);
  }

  @Post()
  async create(@Body() createSectionDto: CreateSectionDto): Promise<Section> {
    return this.sectionsService.create(createSectionDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ): Promise<Section> {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.sectionsService.remove(id);
  }

  @Post('reorder')
  async reorderSections(
    @Query('courseId') courseId: string,
    @Body() newOrder: string[],
  ): Promise<void> {
    return this.sectionsService.reorderSections(courseId, newOrder);
  }
}