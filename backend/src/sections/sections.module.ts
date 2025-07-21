import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { Section, SectionSchema } from './sections.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Section.name, schema: SectionSchema }])],
  providers: [SectionsService],
  controllers: [SectionsController],
  exports: [SectionsService],
})
export class SectionsModule {}
