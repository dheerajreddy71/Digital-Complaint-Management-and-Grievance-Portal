import { NotificationType } from './types';

export interface Notification {
  id: number;
  user_id: number;
  complaint_id: number | null;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: Date;
}

// Create notification payload
export interface CreateNotificationDto {
  user_id: number;
  complaint_id?: number;
  type: NotificationType;
  message: string;
}

// Response with complaint context
export interface NotificationResponse extends Notification {
  complaint_title: string | null;
}
