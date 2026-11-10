import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, LoginInput } from '@repo/shared';
import { mobileAuthApi, getStoredTokens } from './api';

interface MobileAuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

const MobileAuthContext = createContext<MobileAuthContextType | undefined>(undefined);

export function MobileAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const { accessToken } = await getStoredTokens();
        if (accessToken) {
          const profile = await mobileAuthApi.getMe();
          setUser(profile);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (input: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await mobileAuthApi.login(input);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await mobileAuthApi.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </MobileAuthContext.Provider>
  );
}

export function useMobileAuth() {
  const context = useContext(MobileAuthContext);
  if (!context) {
    throw new Error('useMobileAuth must be used within a MobileAuthProvider');
  }
  return context;
}

