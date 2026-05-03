export interface EventDto {
  id: number;
  userId: number;
  title: string;
  description?: string;
  eventType: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  hasReminder: boolean;
  createdAt: string;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  eventType: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  hasReminder: boolean;
  reminderMinutesBefore?: number;
}

export const EVENT_TYPES = ['Course', 'Exam', 'TD', 'Personal', 'Other'];