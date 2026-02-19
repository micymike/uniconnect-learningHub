import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SharedNotesService } from './shared-notes.service';

@Controller('shared-notes')
export class SharedNotesController {
  constructor(private readonly sharedNotesService: SharedNotesService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':partnerId')
  async getSharedNotes(@Req() req, @Param('partnerId') partnerId: string) {
    const userId = req.user?.userId || req.user?.id;
    const notes = await this.sharedNotesService.getSharedNotes(userId, partnerId);
    return { notes };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSharedNote(@Req() req, @Body() body: any) {
    const userId = req.user?.userId || req.user?.id;
    const { title, content, partner_id } = body;
    const note = await this.sharedNotesService.createSharedNote(userId, partner_id, title, content);
    return { note };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':noteId')
  async updateSharedNote(@Req() req, @Param('noteId') noteId: string, @Body() body: any) {
    const userId = req.user?.userId || req.user?.id;
    const { title, content } = body;
    const note = await this.sharedNotesService.updateSharedNote(noteId, userId, title, content);
    return { note };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':noteId')
  async deleteSharedNote(@Req() req, @Param('noteId') noteId: string) {
    const userId = req.user?.userId || req.user?.id;
    await this.sharedNotesService.deleteSharedNote(noteId, userId);
    return { success: true };
  }
}