export interface User {
  id: string; // Changed from number to string to match backend Guid
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string; // Changed from number to string to match backend
  name: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  dueDate?: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string; // Changed from 'token' to 'accessToken' to match backend
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TaskFilters {
  completed?: boolean;
  dueOnOrBefore?: string;
  page?: number;
  pageSize?: number;
}
