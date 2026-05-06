export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  dueDate?: string | null;      // ISO date string (YYYY-MM-DD) — backend Date column serialized as string
  completed: boolean;
  completedAt?: string | null;  // ISO datetime string or null
  createdAt: string;            // ISO datetime string
  updatedAt: string;            // ISO datetime string
  // Phase 3 will add: activityLog?: ActivityLogEntry[]
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;             // YYYY-MM-DD — matches backend @IsDateString() validator
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

// API response envelope — matches backend { data: T, message: string }
export interface ApiResponse<T> {
  data: T;
  message: string;
}

// API error envelope — matches backend { error: string, statusCode: number }
export interface ApiError {
  error: string;
  statusCode: number;
  details?: string[][];
}
