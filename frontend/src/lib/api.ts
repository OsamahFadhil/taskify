import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  Task, 
  User,
  PagedResult,
  TaskFilters,
  LoginRequest,
  RegisterRequest
} from '@/types';

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5045';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        // Only redirect on 401 for authenticated requests (not login/register)
        if (error.response?.status === 401 && 
            !error.config.url?.includes('/api/auth/login') && 
            !error.config.url?.includes('/api/auth/register')) {
          // Token expired or invalid for authenticated requests
          this.removeToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/login', credentials);
    this.setToken(response.data.accessToken); // Changed from token to accessToken
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/register', userData);
    this.setToken(response.data.accessToken);
    return response.data;
  }

  logout(): void {
    this.removeToken();
  }

  // Task endpoints
  async createTask(task: CreateTaskRequest): Promise<Task> {
    const response = await this.client.post<Task>('/api/tasks', task);
    return response.data;
  }

  async getTasks(filters: TaskFilters = {}): Promise<PagedResult<Task>> {
    const params = new URLSearchParams();
    
    if (filters.completed !== undefined) {
      params.append('completed', filters.completed.toString());
    }
    if (filters.dueOnOrBefore) {
      params.append('dueOnOrBefore', filters.dueOnOrBefore);
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.pageSize) {
      params.append('pageSize', filters.pageSize.toString());
    }

    const response = await this.client.get<PagedResult<Task>>(`/api/tasks?${params.toString()}`);
    return response.data;
  }

  async updateTask(id: string, task: UpdateTaskRequest): Promise<Task> {
    const response = await this.client.put<Task>(`/api/tasks/${id}`, task);
    return response.data;
  }

  async deleteTask(id: string): Promise<void> {
    await this.client.delete(`/api/tasks/${id}`);
  }

  async toggleTask(id: string): Promise<Task> {
    const response = await this.client.post<Task>(`/api/tasks/${id}/toggle`);
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      // Decode JWT token to get user info
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      
      console.log('JWT Payload:', payload);
      
      const user: User = {
        id: payload.nameidentifier || payload.user_id || payload.sub || '',
        username: payload.name || payload.username || '',
        email: payload.emailaddress || payload.email || '',
        createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : '2025-01-01T00:00:00.000Z',
        updatedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : '2025-01-01T00:00:00.000Z'
      };
      
      console.log('Decoded User:', user);
      
      // Validate that we have the required fields
      if (!user.id || !user.username) {
        console.log('Missing required fields:', { id: user.id, username: user.username, email: user.email });
        return null;
      }
      
      return user;
    } catch {
      return null;
    }
  }

  // Error handling utility
  static extractErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as { 
        response?: { 
          status?: number;
          data?: { 
            title?: string;
            detail?: string;
            message?: string;
          } 
        } 
      };
      
      const status = axiosError.response?.status;
      const data = axiosError.response?.data;
      
      // Handle specific status codes
      switch (status) {
        case 409: // Conflict
          if (data?.detail) {
            // Handle duplicate registration
            if (data.detail.includes('username') || data.detail.includes('email')) {
              return data.detail;
            }
            return data.detail;
          }
          return 'A conflict occurred. Please check your input and try again.';
          
        case 401: // Unauthorized
          if (data?.detail) {
            return data.detail;
          }
          return 'Invalid credentials. Please check your username/email and password.';
          
        case 400: // Bad Request
          if (data?.detail) {
            return data.detail;
          }
          return 'Invalid input. Please check your form data.';
          
        case 404: // Not Found
          return 'The requested resource was not found.';
          
        case 500: // Internal Server Error
          return 'A server error occurred. Please try again later.';
          
        default:
          if (data?.detail) {
            return data.detail;
          }
          if (data?.message) {
            return data.message;
          }
          if (data?.title) {
            return data.title;
          }
          return 'An unexpected error occurred. Please try again.';
      }
    }
    
    // Handle other error types
    if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unknown error occurred. Please try again.';
  }
}

export const apiClient = new ApiClient();
