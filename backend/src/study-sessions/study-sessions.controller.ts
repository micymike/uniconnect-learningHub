import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StudySessionsService } from './study-sessions.service';

@Controller('study-sessions')
export class StudySessionsController {
  constructor(private readonly studySessionsService: StudySessionsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':partnerId')
  async getStudySessions(@Req() req, @Param('partnerId') partnerId: string) {
    const userId = req.user?.userId || req.user?.id;
    const sessions = await this.studySessionsService.getStudySessions(userId, partnerId);
    return { sessions };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createStudySession(@Req() req, @Body() body: any) {
    const userId = req.user?.userId || req.user?.id;
    const { title, description, start_time, end_time, partner_id } = body;
    const session = await this.studySessionsService.createStudySession(
      userId, partner_id, title, description, start_time, end_time
    );
    return { session };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':sessionId/status')
  async updateSessionStatus(@Req() req, @Param('sessionId') sessionId: string, @Body() body: any) {
    const userId = req.user?.userId || req.user?.id;
    const { status } = body;
    const session = await this.studySessionsService.updateSessionStatus(sessionId, userId, status);
    return { session };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':sessionId')
  async deleteStudySession(@Req() req, @Param('sessionId') sessionId: string) {
    const userId = req.user?.userId || req.user?.id;
    await this.studySessionsService.deleteStudySession(sessionId, userId);
    return { success: true };
  }
}