'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { checkAuthStatus } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { RootState } from '@/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, token } = useAppSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Only check auth status if we have a token but aren't authenticated yet
    if (token && !isAuthenticated && !isLoading) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch, token, isAuthenticated, isLoading]);

  useEffect(() => {
    // Only redirect if we're not loading and definitely not authenticated
    if (!isLoading && !isAuthenticated && !token) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, token, router]);

  // Show loading spinner while checking authentication
  if (isLoading || (token && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
