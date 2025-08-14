import {
  Controller,
  Post,
  Get,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request, Express } from 'express';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 3 * 1024 * 1024 } }))
  async uploadNote(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('contentType') contentType: string,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!name || !name.trim()) throw new BadRequestException('Note name required');
    if (!req.user || !req.user['userId']) throw new BadRequestException('User not authenticated');
    const userId = req.user['userId'];
    return await this.notesService.uploadNote(userId, name.trim(), file, contentType);
  }

  @Get()
  async listNotes(@Req() req: Request) {
    if (!req.user) throw new BadRequestException('User object missing from request. Are you sending a valid JWT?');
    if (!req.user['userId']) throw new BadRequestException('User ID missing from JWT payload.');
    const userId = req.user['userId'];
    return await this.notesService.listNotes(userId);
  }
}
