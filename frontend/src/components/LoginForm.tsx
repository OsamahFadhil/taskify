'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'error' | 'warning' | 'info'>('error');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setErrorType('error');

    try {
      await login(formData.email, formData.password);
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 100);
      } else {
        setTimeout(() => router.push('/dashboard'), 100);
      }
    } catch (err: unknown) {
      let errorMessage = 'An error occurred during login.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      
      if (errorMessage.includes('Invalid credentials')) {
        setErrorType('warning');
      } else if (errorMessage.includes('server error')) {
        setErrorType('error');
      } else {
        setErrorType('info');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getErrorStyles = () => {
    switch (errorType) {
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className={`p-4 border rounded-xl ${getErrorStyles()}`}>
          <div className="flex items-start space-x-3">
            <span className="text-lg">{getErrorIcon()}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{error}</p>
              {errorType === 'warning' && (
                <p className="text-xs mt-1 opacity-80">
                  Please check your username/email and password and try again.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div>
        <Input
          type="text"
          name="email"
          placeholder="Username or Email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
