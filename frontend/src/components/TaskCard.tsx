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
      <div 
        key={`${task.id}-${task.isCompleted}-${task.updatedAt}`}
        className={clsx(
          'group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300',
          'transform hover:-translate-y-1 hover:scale-[1.02]',
          getPriorityColor(),
          task.isCompleted && 'opacity-90 grayscale-[0.2]',
          'backdrop-blur-sm overflow-hidden'
        )}>
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Status Badge */}
        <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-700 rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-600">
          {getStatusIcon()}
        </div>

        <div className="p-6 relative z-10">
          <div className="flex items-start space-x-4">
            {/* Toggle Button */}
            <button
              onClick={handleToggle}
              disabled={isLoading}
              className={clsx(
                'mt-1 flex-shrink-0 transition-all duration-300 disabled:opacity-50',
                'hover:scale-110 p-2 rounded-full',
                'transform hover:rotate-12',
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
                  'font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight transition-all duration-200',
                  task.isCompleted && 'line-through text-gray-500 dark:text-gray-400'
                )}>
                  {task.name}
                </h3>
                
                {task.description && (
                  <p className={clsx(
                    'mt-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 transition-all duration-200',
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
                    'flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-200',
                    isOverdue 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                  )}>
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {formatDate(task.dueDate)}
                      {isOverdue && ' (Overdue)'}
                    </span>
                  </div>
                )}
                
                <div className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
                  task.isCompleted 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                )}>
                  {task.isCompleted ? 'Completed' : 'Active'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="px-4 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 hover:scale-105"
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
              className="px-4 py-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 hover:scale-105"
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
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-2xl w-full max-w-md mx-auto transform transition-all duration-200 scale-95 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Delete Task
                </h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Are you sure you want to delete this task?
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  &ldquo;{task.name}&rdquo;
                </p>
                {task.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {task.description}
                  </p>
                )}
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-3 flex items-center space-x-1">
                <span>⚠</span>
                <span>This action cannot be undone.</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isLoading}
                disabled={isLoading}
                className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Delete Task
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
                className="flex-1 h-12 text-base font-medium rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
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
