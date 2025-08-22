'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterForm } from '@/components/RegisterForm';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';

export default function RegisterPage() {
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  );
}
