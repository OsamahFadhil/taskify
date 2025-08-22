'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { apiClient } from './api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    // First try to get user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch {
        // If parsing fails, remove invalid data
        localStorage.removeItem('user');
      }
    }
    
    // Then check if we have a valid token and can get current user
    const currentUser = apiClient.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(currentUser));
    }
    
    setIsLoading(false);
  }, [isClient]);

  const login = async (usernameOrEmail: string, password: string) => {
    try {
      const response = await apiClient.login({ usernameOrEmail, password });
      setUser(response.user);
      // Save user data to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await apiClient.register({ username, email, password });
      setUser(response.user);
      // Save user data to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.logout();
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoading || !isClient,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
