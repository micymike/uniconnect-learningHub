import { IsString, IsOptional, IsEnum, IsBoolean, IsObject, IsUUID } from 'class-validator';
import { NotificationType, NotificationPriority } from '../interfaces/notification.interface';

export class CreateNotificationDto {
  @IsUUID()
  user_id: string;

  @IsEnum(['assignment_due', 'course_update', 'study_session', 'achievement', 'message', 'study_partner_request', 'reminder'])
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: NotificationPriority = 'medium';

  @IsOptional()
  @IsString()
  action_url?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}

export class NotificationFilterDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @IsOptional()
  @IsEnum(['assignment_due', 'course_update', 'study_session', 'achievement', 'message', 'study_partner_request', 'reminder'])
  type?: NotificationType;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: NotificationPriority;

  @IsOptional()
  limit?: number = 50;

  @IsOptional()
  offset?: number = 0;
}