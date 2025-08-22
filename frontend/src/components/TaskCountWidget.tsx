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
    <div className="space-y-6 mb-8">
      {/* Page Info */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full inline-block">
          Showing {totalTasks} task{totalTasks !== 1 ? 's' : ''} on current page
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Tasks */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Tasks</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalTasks}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ListTodo className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">{completedTasks}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl border border-orange-200 dark:border-orange-800 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Pending</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{pendingTasks}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <Clock className="h-7 w-7 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Completion Rate Bar */}
      {totalTasks > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl">
                <div className="w-4 h-4 bg-white rounded-lg"></div>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Progress Overview</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completionRate}%</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Complete</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );
}
