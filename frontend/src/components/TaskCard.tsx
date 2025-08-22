'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { Button } from './ui/Button';
import { CheckCircle, Circle, Calendar, Edit, Trash2, X, Clock, Tag } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
}

export function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (task.dueDate && !task.isCompleted) {
      const now = new Date();
      const dueDate = new Date(task.dueDate);
      setIsOverdue(dueDate < now);
    }
  }, [task.dueDate, task.isCompleted]);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggle(task.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(task.id);
      setShowDeleteModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPriorityColor = () => {
    if (isOverdue) return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10';
    if (task.dueDate) return 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10';
    return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10';
  };

  const getStatusIcon = () => {
    if (task.isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
    }
    if (isOverdue) {
      return <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />;
    }
    if (task.dueDate) {
      return <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
    }
    return <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
  };

  return (
    <>
      <div className={clsx(
        'group relative bg-white dark:bg-gray-800 rounded-xl border-l-4 border shadow-sm hover:shadow-lg transition-all duration-300',
        'transform hover:-translate-y-1 hover:scale-[1.02]',
        getPriorityColor(),
        task.isCompleted && 'opacity-80 grayscale-[0.3]',
        'backdrop-blur-sm'
      )}>
        {/* Status Badge */}
        <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md">
          {getStatusIcon()}
        </div>

        <div className="p-6">
          <div className="flex items-start space-x-4">
            {/* Toggle Button */}
            <button
              onClick={handleToggle}
              disabled={isLoading}
              className={clsx(
                'mt-1 flex-shrink-0 transition-all duration-200 disabled:opacity-50',
                'hover:scale-110 p-2 rounded-full',
                task.isCompleted 
                  ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20' 
                  : 'text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20'
              )}
            >
              {task.isCompleted ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <Circle className="h-6 w-6" />
              )}
            </button>
            
            {/* Content */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h3 className={clsx(
                  'font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight',
                  task.isCompleted && 'line-through text-gray-500 dark:text-gray-400'
                )}>
                  {task.name}
                </h3>
                
                {task.description && (
                  <p className={clsx(
                    'mt-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3',
                    task.isCompleted && 'line-through text-gray-400 dark:text-gray-500'
                  )}>
                    {task.description}
                  </p>
                )}
              </div>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {task.dueDate && (
                  <div className={clsx(
                    'flex items-center space-x-2 px-3 py-1.5 rounded-full',
                    isOverdue 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  )}>
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {formatDate(task.dueDate)}
                      {isOverdue && ' (Overdue)'}
                    </span>
                  </div>
                )}
                
                <div className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium',
                  task.isCompleted 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                )}>
                  {task.isCompleted ? 'Completed' : 'Active'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
              title="Edit task"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
              title="Delete task"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl w-full max-w-sm mx-auto transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Delete Task
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete &quot;{task.name}&quot;? This action cannot be undone.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isLoading}
                disabled={isLoading}
                className="flex-1 order-2 sm:order-1"
              >
                Delete Task
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
                className="flex-1 order-1 sm:order-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
