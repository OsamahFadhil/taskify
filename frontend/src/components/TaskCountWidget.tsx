'use client';

import React from 'react';
import { Task } from '@/types';
import { CheckCircle, Clock, ListTodo } from 'lucide-react';

interface TaskCountWidgetProps {
  tasks: Task[];
}

export function TaskCountWidget({ tasks }: TaskCountWidgetProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Page Info */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {totalTasks} task{totalTasks !== 1 ? 's' : ''} on current page
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalTasks}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ListTodo className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedTasks}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingTasks}</p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Completion Rate Bar */}
        {totalTasks > 0 && (
          <div className="sm:col-span-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
