'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, LoginInput, RegisterInput, UserRole } from '@repo/shared';
import { authApi, setAccessToken } from './api';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Attempt silent session restoration on mount via refresh token cookie
    async function initAuth() {
      try {
        const res = await authApi.refresh();
        setUser(res.user);
      } catch (err) {
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (input: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(input);
      setUser(res.user);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (input: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(input);
      setUser(res.user);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

