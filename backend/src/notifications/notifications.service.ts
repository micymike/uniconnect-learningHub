import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Inject } from '@nestjs/common';
import { CreateNotificationDto, UpdateNotificationDto, NotificationFilterDto } from './dto/notification.dto';
import { Notification, CreateNotificationData } from './interfaces/notification.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert([createNotificationDto])
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating notification:', error);
        throw new Error(`Failed to create notification: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.logger.error('Error in createNotification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string, filter: NotificationFilterDto = {}): Promise<Notification[]> {
    try {
      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filter.read !== undefined) {
        query = query.eq('read', filter.read);
      }

      if (filter.type) {
        query = query.eq('type', filter.type);
      }

      if (filter.priority) {
        query = query.eq('priority', filter.priority);
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Error fetching notifications:', error);
        throw new Error(`Failed to fetch notifications: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      this.logger.error('Error in getUserNotifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        this.logger.error('Error marking notification as read:', error);
        throw new Error(`Failed to mark notification as read: ${error.message}`);
      }

      return data;
    } catch (error) {
      this.logger.error('Error in markAsRead:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        this.logger.error('Error marking all notifications as read:', error);
        throw new Error(`Failed to mark all notifications as read: ${error.message}`);
      }
    } catch (error) {
      this.logger.error('Error in markAllAsRead:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        this.logger.error('Error getting unread count:', error);
        throw new Error(`Failed to get unread count: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      this.logger.error('Error in getUnreadCount:', error);
      throw error;
    }
  }

  // Helper methods for creating specific notification types
  async createAssignmentDueNotification(userId: string, assignmentTitle: string, dueDate: Date): Promise<Notification> {
    const hoursUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60));
    
    return this.createNotification({
      user_id: userId,
      type: 'assignment_due',
      title: `Assignment Due ${hoursUntilDue <= 24 ? 'Soon' : 'This Week'}`,
      message: `Your assignment "${assignmentTitle}" is due ${hoursUntilDue <= 1 ? 'in less than an hour' : `in ${hoursUntilDue} hours`}. Don't forget to submit!`,
      priority: hoursUntilDue <= 2 ? 'urgent' : hoursUntilDue <= 24 ? 'high' : 'medium',
      action_url: '/student/assignments',
      metadata: { assignment_title: assignmentTitle, due_date: dueDate.toISOString(), hours_remaining: hoursUntilDue }
    });
  }

  async createStudySessionNotification(userId: string, partnerName: string, sessionTime: Date, subject?: string): Promise<Notification> {
    const minutesUntilSession = Math.ceil((sessionTime.getTime() - Date.now()) / (1000 * 60));
    
    return this.createNotification({
      user_id: userId,
      type: 'study_session',
      title: `Study Session ${minutesUntilSession <= 30 ? 'Starting Soon' : 'Scheduled'}`,
      message: `Your study session with ${partnerName} ${minutesUntilSession <= 5 ? 'is starting now' : `starts in ${minutesUntilSession} minutes`}${subject ? ` for ${subject}` : ''}. Get ready to collaborate!`,
      priority: minutesUntilSession <= 5 ? 'urgent' : minutesUntilSession <= 30 ? 'high' : 'medium',
      action_url: '/student/study-space',
      metadata: { partner_name: partnerName, session_time: sessionTime.toISOString(), subject, minutes_remaining: minutesUntilSession }
    });
  }

  async createAchievementNotification(userId: string, achievementTitle: string, description: string): Promise<Notification> {
    return this.createNotification({
      user_id: userId,
      type: 'achievement',
      title: `🏆 Achievement Unlocked: ${achievementTitle}`,
      message: description,
      priority: 'low',
      metadata: { achievement_title: achievementTitle }
    });
  }

  async createCourseUpdateNotification(userId: string, courseTitle: string, updateType: string, description: string): Promise<Notification> {
    return this.createNotification({
      user_id: userId,
      type: 'course_update',
      title: `📚 ${courseTitle}: ${updateType}`,
      message: description,
      priority: 'medium',
      action_url: '/student/courses',
      metadata: { course_title: courseTitle, update_type: updateType }
    });
  }

  async createMessageNotification(userId: string, senderName: string, messagePreview: string): Promise<Notification> {
    return this.createNotification({
      user_id: userId,
      type: 'message',
      title: `💬 New message from ${senderName}`,
      message: messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview,
      priority: 'medium',
      action_url: '/student/study-space',
      metadata: { sender_name: senderName, preview: messagePreview }
    });
  }
}