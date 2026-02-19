export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export type NotificationType = 
  | 'assignment_due'
  | 'course_update'
  | 'study_session'
  | 'achievement'
  | 'message'
  | 'study_partner_request'
  | 'reminder';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CreateNotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  action_url?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilter {
  read?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}