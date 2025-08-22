'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="p-2"
        disabled
      >
        <div className="h-4 w-4 animate-pulse bg-gray-300 rounded" />
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggleTheme}
      className="p-2 hover:scale-105 transition-transform duration-200"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
