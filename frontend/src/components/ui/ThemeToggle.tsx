'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from './Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTheme } from '@/store/slices/uiSlice';
import { RootState } from '@/store';

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state: RootState) => state.ui.theme);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="p-2 cursor-pointer"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
