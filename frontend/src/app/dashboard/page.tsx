'use client';

import React, { useEffect, useCallback } from 'react';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { TaskCountWidget } from '@/components/TaskCountWidget';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Plus, Filter, LogOut, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  toggleTask, 
  deleteTask,
  setFilters,
  clearFilters,
  setCurrentTask,
  setPage
} from '@/store/slices/tasksSlice';
import { logoutUser } from '@/store/slices/authSlice';
import { 
  toggleTaskForm, 
  toggleFilters, 
  toggleMobileMenu,
  closeAllModals 
} from '@/store/slices/uiSlice';
import { CreateTaskRequest, UpdateTaskRequest, Task } from '@/types';

function DashboardContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  // Redux state
  const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const { 
    items: tasks, 
    filters, 
    isLoading, 
    error, 
    currentTask,
    totalPages
  } = useAppSelector((state: RootState) => state.tasks);
  const { 
    showTaskForm, 
    showFilters, 
    showMobileMenu 
  } = useAppSelector((state: RootState) => state.ui);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    // First set the page to clear current items
    dispatch(setPage(page));
    // Then fetch tasks for the new page
    dispatch(fetchTasks({ ...filters, page }));
  }, [dispatch, filters]);

  // Show loading state when changing pages
  const isPageChanging = isLoading && tasks.length === 0;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTasks(filters));
    }
  }, [dispatch, filters, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Remove the problematic cleanup effect that causes vibration
  // useEffect(() => {
  //   if (tasks.length > 0) {
  //     dispatch(cleanupDuplicates());
  //   }
  // }, [tasks.length, dispatch]);

  const handleCreateTask = async (data: CreateTaskRequest) => {
    try {
      await dispatch(createTask(data)).unwrap();
      dispatch(toggleTaskForm(false));
      dispatch(closeAllModals());
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (data: UpdateTaskRequest) => {
    if (!currentTask) return;
    
    try {
      await dispatch(updateTask({ id: currentTask.id, taskData: data })).unwrap();
      dispatch(setCurrentTask(null));
      dispatch(closeAllModals());
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      await dispatch(toggleTask(id)).unwrap();
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await dispatch(deleteTask(id)).unwrap();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string | boolean | undefined) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleEditTask = (task: Task) => {
    dispatch(setCurrentTask(task));
  };

  const handleCloseTaskForm = () => {
    dispatch(toggleTaskForm(false));
    dispatch(setCurrentTask(null));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Welcome - Mobile */}
            <div className="flex items-center gap-3 lg:hidden">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Taskly</h1>
            </div>
            
            {/* Logo and Welcome - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Taskly</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user?.username}</span>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleMobileMenu())}
                className="p-2 cursor-pointer"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleTaskForm(true))}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleFilters())}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              <ThemeToggle />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Welcome, {user?.username}</span>
                <ThemeToggle />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    dispatch(toggleTaskForm(true));
                    dispatch(toggleMobileMenu(false));
                  }}
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <Plus className="h-4 w-4" />
                  New Task
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    dispatch(toggleFilters());
                    dispatch(toggleMobileMenu(false));
                  }}
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleLogout();
                  dispatch(toggleMobileMenu(false));
                }}
                className="flex items-center justify-center gap-2 w-full text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="responsive-container py-4 sm:py-6 lg:py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-responsive-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Task Count Widget */}
        <TaskCountWidget tasks={tasks} />

        {/* Filters */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-responsive-sm mb-6 shadow-responsive-md">
            <div className="grid-responsive-4 gap-4">
              <div>
                <label className="block text-responsive-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Status
                </label>
                <select
                  value={filters.completed === undefined ? '' : filters.completed.toString()}
                  onChange={(e) => handleFilterChange('completed', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer mobile-input"
                >
                  <option value="">All</option>
                  <option value="false">Pending</option>
                  <option value="true">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-responsive-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={filters.dueOnOrBefore || ''}
                  onChange={(e) => handleFilterChange('dueOnOrBefore', e.target.value || undefined)}
                  className="mobile-input"
                />
              </div>
              
              <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                <Button
                  variant="secondary"
                  onClick={handleClearFilters}
                  className="w-full mobile-button"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Task Form Modal */}
        {(showTaskForm || currentTask) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-responsive-sm z-50">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <TaskForm
                task={currentTask || undefined}
                onSubmit={async (data: CreateTaskRequest | UpdateTaskRequest) => {
                  if (currentTask) {
                    await handleUpdateTask(data as UpdateTaskRequest);
                  } else {
                    await handleCreateTask(data as CreateTaskRequest);
                  }
                }}
                onCancel={handleCloseTaskForm}
              />
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-responsive-sm">
          {isPageChanging ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-responsive-sm">Loading tasks...</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-responsive-sm">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 dark:text-gray-400 text-responsive-lg">No tasks found</p>
              <p className="text-gray-400 dark:text-gray-500 mt-2 text-responsive-sm">Create your first task to get started</p>
            </div>
          ) : (
            <>
              {tasks.map((task: Task, index: number) => (
                <TaskCard
                  key={`${task.id}-${index}`}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
              
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
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
