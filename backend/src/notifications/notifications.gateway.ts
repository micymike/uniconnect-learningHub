import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationData } from './interfaces/notification.interface';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly notificationsService: NotificationsService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      client.join(`user_${userId}`);
      this.logger.log(`User ${userId} connected for notifications`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = Array.from(this.connectedUsers.entries())
      .find(([, socketId]) => socketId === client.id)?.[0];
    
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`User ${userId} disconnected from notifications`);
    }
  }

  // Send notification to specific user
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('new-notification', notification);
  }

  // Send real-time notifications for different events
  async sendAssignmentDueNotification(userId: string, assignmentTitle: string, dueDate: Date) {
    const notification = await this.notificationsService.createAssignmentDueNotification(
      userId,
      assignmentTitle,
      dueDate
    );
    
    this.server.to(`user_${userId}`).emit('assignment-due-soon', {
      id: notification.id,
      title: assignmentTitle,
      due_date: dueDate.toISOString(),
      hours_remaining: Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60))
    });
  }

  async sendStudySessionNotification(userId: string, partnerName: string, sessionTime: Date, subject?: string) {
    const notification = await this.notificationsService.createStudySessionNotification(
      userId,
      partnerName,
      sessionTime,
      subject
    );
    
    this.server.to(`user_${userId}`).emit('study-session-starting', {
      id: notification.id,
      partner_name: partnerName,
      start_time: sessionTime.toISOString(),
      subject
    });
  }

  async sendAchievementNotification(userId: string, achievementTitle: string, description: string) {
    const notification = await this.notificationsService.createAchievementNotification(
      userId,
      achievementTitle,
      description
    );
    
    this.server.to(`user_${userId}`).emit('achievement-unlocked', {
      id: notification.id,
      title: achievementTitle,
      message: description
    });
  }

  async sendMessageNotification(userId: string, senderName: string, messageContent: string) {
    const notification = await this.notificationsService.createMessageNotification(
      userId,
      senderName,
      messageContent
    );
    
    this.server.to(`user_${userId}`).emit('new-message', {
      id: notification.id,
      sender_name: senderName,
      content: messageContent
    });
  }

  async sendCourseUpdateNotification(userId: string, courseTitle: string, updateType: string, description: string) {
    const notification = await this.notificationsService.createCourseUpdateNotification(
      userId,
      courseTitle,
      updateType,
      description
    );
    
    this.server.to(`user_${userId}`).emit('course-update', {
      id: notification.id,
      course_title: courseTitle,
      update_type: updateType,
      description
    });
  }

  // Broadcast to all connected users (for system-wide notifications)
  async broadcastSystemNotification(title: string, message: string) {
    this.server.emit('system-notification', {
      title,
      message,
      timestamp: new Date().toISOString()
    });
  }
}