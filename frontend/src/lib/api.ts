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

class ApiClient {
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
      return localStorage.getItem('taskly_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskly_token', token);
    }
  }

  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('taskly_token');
    }
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🔍 API Login Request:', credentials);
    const response = await this.client.post<AuthResponse>('/api/auth/login', credentials);
    console.log('🔍 API Login Response:', response.data);
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
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.user_id || payload.sub || payload.nameidentifier,
        username: payload.username || payload.name,
        email: payload.emailaddress || payload.email,
        createdAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : '2025-01-01T00:00:00.000Z',
        updatedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : '2025-01-01T00:00:00.000Z'
      };
    } catch {
      return null;
    }
  }
}

export const apiClient = new ApiClient();
