'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeNotification, Notification } from '@/store/slices/uiSlice';
import { RootState } from '@/store';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const notificationIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const notificationColors = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
};

export function NotificationSystem() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state: RootState) => state.ui.notifications);

  useEffect(() => {
    notifications.forEach((notification: Notification) => {
      if (notification.duration) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification: Notification) => {
        const Icon = notificationIcons[notification.type];
        
        return (
          <div
            key={notification.id}
            className={`flex items-center p-4 border rounded-lg shadow-lg max-w-sm ${notificationColors[notification.type]}`}
          >
            <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => dispatch(removeNotification(notification.id))}
              className="ml-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
