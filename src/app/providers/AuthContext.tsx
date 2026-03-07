import React, { createContext, useContext, useEffect, useState } from 'react';

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

  const refreshAuth = async () => {
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
  };

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
    // /login/success 페이지에서는 LoginSuccess 컴포넌트가 직접 토큰 발급을 처리.
    // AuthProvider가 동시에 getAccessToken()을 호출하면 refresh token이 이중 소비되므로 스킵.
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
