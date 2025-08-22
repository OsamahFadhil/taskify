import React, { useId } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500',
          'dark:focus:ring-blue-400 dark:focus:border-blue-400',
          'dark:disabled:bg-gray-700 dark:disabled:text-gray-400',
          'cursor-text',
          error && 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
