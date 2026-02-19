import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StudyGroupsService } from './study-groups.service';

@Controller('study-groups')
export class StudyGroupsController {
  constructor(private readonly studyGroupsService: StudyGroupsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':partnerId/members')
  async getGroupMembers(@Req() req, @Param('partnerId') partnerId: string) {
    const userId = req.user?.userId || req.user?.id;
    const members = await this.studyGroupsService.getGroupMembers(userId, partnerId);
    return { members };
  }

  @UseGuards(JwtAuthGuard)
  @Post('invite')
  async inviteToGroup(@Req() req, @Body() body: any) {
    const userId = req.user?.userId || req.user?.id;
    const { partner_id, invited_user_id } = body;
    const invitation = await this.studyGroupsService.inviteToGroup(userId, partner_id, invited_user_id);
    return { invitation };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':partnerId/members/:memberId')
  async removeFromGroup(@Req() req, @Param('partnerId') partnerId: string, @Param('memberId') memberId: string) {
    const userId = req.user?.userId || req.user?.id;
    await this.studyGroupsService.removeFromGroup(userId, partnerId, memberId);
    return { success: true };
  }
}