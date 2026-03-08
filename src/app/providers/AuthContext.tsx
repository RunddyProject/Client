import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { authService } from '@/features/user/api/auth';

import type { User } from '@/features/user/api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (provider: 'kakao' | 'naver') => void;
  logout: () => Promise<void>;
  deleteAccount: (data: string[]) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stable reference required — consumed in useEffect deps (e.g. LoginSuccess)
  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const isAuth = await authService.initialize();
      if (isAuth) {
        const currentUser = await authService.getUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[AuthProvider] refreshAuth failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (provider: 'kakao' | 'naver') => {
    authService.startSocialLogin(provider);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const deleteAccount = async (data: string[]) => {
    await authService.deleteAccount(data);
    setUser(null);
  };

  useEffect(() => {
    // LoginSuccess handles token exchange on the OAuth callback page.
    // Skipping auto-init here prevents a race where both AuthProvider and
    // LoginSuccess call getAccessToken() simultaneously, which can exhaust
    // a single-use refresh token before the user lands on the app.
    if (window.location.pathname === '/login/success') {
      setIsLoading(false);
      return;
    }
    refreshAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    deleteAccount,
    refreshAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
