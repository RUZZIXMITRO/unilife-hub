export interface NotificationDto {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  relatedEventId?: number;
  relatedTodoId?: number;
}