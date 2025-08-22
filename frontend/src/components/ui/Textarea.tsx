import React from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={clsx(
        'block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
        'resize-vertical min-h-[100px]',
        'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500',
        'dark:focus:ring-blue-400 dark:focus:border-blue-400',
        'dark:disabled:bg-gray-700 dark:disabled:text-gray-400',
        'transition-all duration-200',
        'text-base',
        error && 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400',
        className
      )}
      {...props}
    />
  );
}
