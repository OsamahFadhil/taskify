'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/lib/validations';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';

export function RegisterForm() {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data: RegisterFormData) => {
    if (isLoading) return;
    
    dispatch(registerUser(data));
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-responsive-sm sm:p-responsive-md shadow-responsive-lg mobile-form">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-responsive-xl sm:text-responsive-2xl font-bold text-gray-900 dark:text-gray-100">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-responsive-sm sm:text-responsive-base">Sign up to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-responsive-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-responsive-md">
          <Input
            label="Username"
            {...register('username')}
            error={errors.username?.message}
            placeholder="Choose a username"
            autoComplete="username"
            required
            className="mobile-input"
          />

          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            placeholder="Enter your email"
            autoComplete="email"
            required
            className="mobile-input"
          />

          <Input
            label="Password"
            type="password"
            {...register('password')}
            error={errors.password?.message}
            placeholder="Create a password"
            autoComplete="new-password"
            required
            className="mobile-input"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full mobile-button"
            disabled={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-responsive-sm text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
