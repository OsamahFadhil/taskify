'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { TaskCountWidget } from '@/components/TaskCountWidget';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Plus, Filter, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiClient } from '@/lib/api';
import { Task, TaskFilters, CreateTaskRequest, UpdateTaskRequest } from '@/types';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({
    page: 1,
    pageSize: 20,
    completed: undefined,
    dueOnOrBefore: undefined
  });
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'error' | 'warning' | 'info'>('error');
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);

  const setErrorWithType = (message: string) => {
    setError(message);
    if (message.includes('already taken') || message.includes('duplicate')) {
      setErrorType('warning');
    } else if (message.includes('server error') || message.includes('Failed to')) {
      setErrorType('error');
    } else if (message.includes('Validation failed') || message.includes('Invalid')) {
      setErrorType('info');
    } else {
      setErrorType('error');
    }
  };

  const getErrorStyles = () => {
    switch (errorType) {
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
      }
    }
  }, []);

  const fetchTasks = useCallback(async (taskFilters: TaskFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.getTasks(taskFilters);
      setTasks(result.items);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      const errorMessage = ApiClient.extractErrorMessage(err);
      setErrorWithType(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchTasks(newFilters);
  }, [filters, fetchTasks]);

  const handleFiltersChange = useCallback((newFilters: Partial<TaskFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    fetchTasks(updatedFilters);
  }, [filters, fetchTasks]);

  const handleCreateTask = async (taskData: CreateTaskRequest) => {
    try {
      const newTask = await apiClient.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      setShowTaskForm(false);
    } catch (err: unknown) {
      const errorMessage = ApiClient.extractErrorMessage(err);
      setErrorWithType(errorMessage);
    }
  };

  const handleUpdateTask = async (id: string, taskData: UpdateTaskRequest) => {
    try {
      const updatedTask = await apiClient.updateTask(id, taskData);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      setCurrentTask(null);
      setShowTaskForm(false);
    } catch (err: unknown) {
      const errorMessage = ApiClient.extractErrorMessage(err);
      setErrorWithType(errorMessage);
    }
  };

  const handleTaskSubmit = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    if (currentTask) {
      await handleUpdateTask(currentTask.id, data as UpdateTaskRequest);
    } else {
      await handleCreateTask(data as CreateTaskRequest);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      const updatedTask = await apiClient.toggleTask(id);
      
      setTasks(prev => {
        const newTasks = prev.map(task => task.id === id ? updatedTask : task);
        return newTasks;
      });
    } catch (err: unknown) {
      const errorMessage = ApiClient.extractErrorMessage(err);
      setErrorWithType(errorMessage);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await apiClient.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err: unknown) {
      const errorMessage = ApiClient.extractErrorMessage(err);
      setErrorWithType(errorMessage);
    }
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setShowTaskForm(true);
  };

  const handleLogout = () => {
    console.log('Logging out');
    apiClient.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  useEffect(() => {
    fetchTasks(filters);
  }, [fetchTasks, filters]);

  useEffect(() => {
    if ((filters.page || 1) !== 1) {
      fetchTasks(filters);
    }
  }, [filters.page, filters.completed, filters.dueOnOrBefore, fetchTasks, filters]);

  useEffect(() => {
    if ((filters.page || 1) > 1) {
      fetchTasks(filters);
    }
  }, [filters.page, fetchTasks, filters]);

  const isPageChanging = isLoading && tasks.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg"></div>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Taskify
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Welcome back, {user?.username || 'User'}! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Manage your tasks and stay organized with Taskify
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className={`mb-6 p-4 rounded-xl ${getErrorStyles()}`}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getErrorIcon()}</span>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Task Count Widget */}
        <TaskCountWidget tasks={tasks} />

        {/* Filters and Actions */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <Filter className="h-4 w-4" />
                Filters
                <span className="text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                  {showFilters ? 'Hide' : 'Show'}
                </span>
              </Button>
              
              {showFilters && (
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
                    <select
                      value={filters.completed === undefined ? '' : filters.completed.toString()}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : e.target.value === 'true';
                        handleFiltersChange({ completed: value });
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200"
                    >
                      <option value="">All Tasks</option>
                      <option value="false">Pending</option>
                      <option value="true">Completed</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date:</label>
                    <Input
                      type="date"
                      value={filters.dueOnOrBefore || ''}
                      onChange={(e) => handleFiltersChange({ dueOnOrBefore: e.target.value || undefined })}
                      placeholder="Due date"
                      className="w-40"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <Button
              onClick={() => {
                setCurrentTask(null);
                setShowTaskForm(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Task Form Modal */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="w-full max-w-lg transform transition-all duration-200 scale-95 animate-in zoom-in-95 duration-200">
              <TaskForm
                task={currentTask || undefined}
                onSubmit={handleTaskSubmit}
                onCancel={() => {
                  setShowTaskForm(false);
                  setCurrentTask(null);
                }}
              />
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {isLoading && tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No tasks found</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {tasks.map((task: Task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              <Pagination
                currentPage={filters.page || 1}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isPageChanging}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
