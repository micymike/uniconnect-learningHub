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
    @Body('folder') folder: string,
    @Body('tags') tags: string | string[],
    @Body('color_label') color_label: string,
    @Body('icon') icon: string,
    @Body('file_type') file_type: string,
    @Body('ocr_text') ocr_text: string,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!name || !name.trim()) throw new BadRequestException('Note name required');
    if (!req.user || !req.user['userId']) throw new BadRequestException('User not authenticated');
    const userId = req.user['userId'];
    // Parse tags if sent as a comma-separated string
    let parsedTags: string[] = [];
    if (typeof tags === 'string') {
      parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (Array.isArray(tags)) {
      parsedTags = tags;
    }
    return await this.notesService.uploadNote(
      userId,
      name.trim(),
      file,
      contentType,
      folder,
      parsedTags,
      color_label,
      icon,
      file_type,
      ocr_text
    );
  }

  @Post('flashcard-score')
  async saveFlashcardScore(
    @Body('score') score: number,
    @Body('bonus') bonus: number,
    @Body('numQuestions') numQuestions: number,
    @Body('timestamp') timestamp: string,
    @Req() req: Request
  ) {
    if (!req.user || !req.user['userId']) throw new BadRequestException('User not authenticated');
    const userId = req.user['userId'];
    return await this.notesService.saveFlashcardScore(userId, score, bonus, numQuestions, timestamp);
  }

  @Get()
  async listNotes(@Req() req: Request) {
    if (!req.user) throw new BadRequestException('User object missing from request. Are you sending a valid JWT?');
    if (!req.user['userId']) throw new BadRequestException('User ID missing from JWT payload.');
    const userId = req.user['userId'];
    return await this.notesService.listNotes(userId);
  }

  @Post('save-transcription')
  async saveTranscription(
    @Body('transcription') transcription: string,
    @Body('noteName') noteName: string,
    @Req() req: Request,
  ) {
    if (!transcription || !transcription.trim()) throw new BadRequestException('Transcription text required');
    if (!noteName || !noteName.trim()) throw new BadRequestException('Note name required');
    if (!req.user || !req.user['userId']) throw new BadRequestException('User not authenticated');
    
    const userId = req.user['userId'];
    return await this.notesService.saveTranscribedNote(userId, transcription.trim(), noteName.trim());
  }

  @Post('save-generated')
  async saveGeneratedNote(
    @Body('noteName') noteName: string,
    @Body('content') content: string,
    @Body('timestamp') timestamp: string,
    @Req() req: Request,
  ) {
    if (!noteName || !noteName.trim()) throw new BadRequestException('Note name required');
    if (!content || !content.trim()) throw new BadRequestException('Note content required');
    if (!timestamp || !timestamp.trim()) throw new BadRequestException('Timestamp required');
    if (!req.user || !req.user['userId']) throw new BadRequestException('User not authenticated');
    const userId = req.user['userId'];
    return await this.notesService.saveGeneratedNote(userId, noteName.trim(), content.trim(), timestamp.trim());
  }
}
