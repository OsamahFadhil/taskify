'use client';

import { Provider } from 'react-redux';
import { store, RootState } from './index';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { checkAuthStatus } from './slices/authSlice';
import { setTheme } from './slices/uiSlice';

function ThemeInitializer() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state: RootState) => state.ui.theme);

  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme && savedTheme !== theme) {
      dispatch(setTheme(savedTheme));
    }
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme, dispatch]);

  return null;
}

function AuthInitializer() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token) {
      dispatch(checkAuthStatus());
    }
  }, [dispatch, token]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeInitializer />
      <AuthInitializer />
      {children}
    </Provider>
  );
}
