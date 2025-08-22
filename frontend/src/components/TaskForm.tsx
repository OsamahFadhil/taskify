'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types';
import { createTaskSchema, updateTaskSchema } from '@/lib/validations';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { X } from 'lucide-react';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const isEditing = !!task;
  const schema = isEditing ? updateTaskSchema : createTaskSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskRequest | UpdateTaskRequest>({
    resolver: zodResolver(schema),
    defaultValues: task ? {
      name: task.name,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    } : {
      name: '',
      description: '',
      dueDate: '',
    },
  });

  const handleFormSubmit = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    // Filter out empty optional fields
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== '')
    );
    
    await onSubmit(filteredData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-responsive-sm sm:p-responsive-md shadow-responsive-lg w-full max-w-md mx-auto mobile-form">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-responsive-lg sm:text-responsive-xl font-semibold text-gray-900 dark:text-gray-100">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 touch-target"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-responsive-md">
        <Input
          label="Task Name"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Enter task name"
          required
          className="mobile-input"
        />

        <Textarea
          label="Description (Optional)"
          {...register('description')}
          error={errors.description?.message}
          placeholder="Enter task description"
          className="mobile-input"
        />

        <Input
          label="Due Date (Optional)"
          type="date"
          {...register('dueDate')}
          error={errors.dueDate?.message}
          helperText="Leave empty if no due date"
          className="mobile-input"
        />

        <div className="flex flex-responsive-col space-responsive-sm pt-4">
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1 order-2 sm:order-1 mobile-button"
          >
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 order-1 sm:order-2 mobile-button"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
