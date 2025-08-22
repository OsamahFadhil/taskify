'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/types';
import { createTaskSchema, updateTaskSchema } from '@/lib/validations';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { X, Plus, Edit3, Calendar, FileText, Tag } from 'lucide-react';

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
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== '')
    );
    
    await onSubmit(filteredData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-2xl w-full max-w-lg mx-auto backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            {isEditing ? (
              <Edit3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            ) : (
              <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditing ? 'Update your task details' : 'Add a new task to your list'}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Task Name */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Task Name *
            </label>
          </div>
          <Input
            {...register('name')}
            placeholder="Enter task name..."
            error={errors.name?.message}
            className="text-lg font-medium"
          />
          {errors.name && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
              <span>⚠</span>
              <span>{errors.name.message}</span>
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <span className="text-xs text-gray-400 dark:text-gray-500">(Optional)</span>
          </div>
          <Textarea
            {...register('description')}
            placeholder="Describe your task in detail..."
            error={errors.description?.message}
          />
          {errors.description && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
              <span>⚠</span>
              <span>{errors.description.message}</span>
            </p>
          )}
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Due Date
            </label>
            <span className="text-xs text-gray-400 dark:text-gray-500">(Optional)</span>
          </div>
          <Input
            type="date"
            {...register('dueDate')}
            error={errors.dueDate?.message}
          />
          {errors.dueDate && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
              <span>⚠</span>
              <span>{errors.dueDate.message}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6">
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {isEditing ? 'Update Task' : 'Create Task'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="h-12 px-6 text-base font-medium rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
