import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationDto, NotificationFilterDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(@Request() req, @Query() filter: NotificationFilterDto) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    const notifications = await this.notificationsService.getUserNotifications(userId, filter);
    return { notifications };
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    const count = await this.notificationsService.getUnreadCount(userId);
    return { unread_count: count };
  }

  @Put(':id/read')
  async markAsRead(@Param('id') notificationId: string, @Request() req) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    const notification = await this.notificationsService.markAsRead(notificationId, userId);
    return { notification };
  }

  @Put('mark-all-read')
  async markAllAsRead(@Request() req) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  // Admin/System endpoints for creating notifications
  @Post()
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    const notification = await this.notificationsService.createNotification(createNotificationDto);
    return { notification };
  }

  // Helper endpoints for specific notification types
  @Post('assignment-due')
  async createAssignmentDueNotification(
    @Body() body: { user_id: string; assignment_title: string; due_date: string }
  ) {
    const notification = await this.notificationsService.createAssignmentDueNotification(
      body.user_id,
      body.assignment_title,
      new Date(body.due_date)
    );
    return { notification };
  }

  @Post('study-session')
  async createStudySessionNotification(
    @Body() body: { user_id: string; partner_name: string; session_time: string; subject?: string }
  ) {
    const notification = await this.notificationsService.createStudySessionNotification(
      body.user_id,
      body.partner_name,
      new Date(body.session_time),
      body.subject
    );
    return { notification };
  }

  @Post('achievement')
  async createAchievementNotification(
    @Body() body: { user_id: string; achievement_title: string; description: string }
  ) {
    const notification = await this.notificationsService.createAchievementNotification(
      body.user_id,
      body.achievement_title,
      body.description
    );
    return { notification };
  }

  @Post('course-update')
  async createCourseUpdateNotification(
    @Body() body: { user_id: string; course_title: string; update_type: string; description: string }
  ) {
    const notification = await this.notificationsService.createCourseUpdateNotification(
      body.user_id,
      body.course_title,
      body.update_type,
      body.description
    );
    return { notification };
  }

  @Post('message')
  async createMessageNotification(
    @Body() body: { user_id: string; sender_name: string; message_preview: string }
  ) {
    const notification = await this.notificationsService.createMessageNotification(
      body.user_id,
      body.sender_name,
      body.message_preview
    );
    return { notification };
  }
}