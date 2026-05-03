export interface TodoDto {
  id: number;
  userId: number;
  title: string;
  description?: string;
  priority: string;
  category?: string;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  isOverdue: boolean;
  daysOverdue: number;
  createdAt: string;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
  priority: string;
  category?: string;
  dueDate?: string;
}

export const PRIORITIES = ['Low', 'Medium', 'High'];