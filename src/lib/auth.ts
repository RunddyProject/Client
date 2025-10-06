import { api } from '@/lib/api';

// Auth service for handling social login and token management
export interface UserToken {
  iss: string;
  sub: string;
  roles: string[];
  iat: number;
  exp: number;
  jti: string;
}

export interface User {
  id: string;
  provider: string;
  roles: string[];
  nickname?: string;
  profileUrl?: string;
}

const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
const CLIENT_URL = import.meta.env.VITE_CLIENT_URL;

export class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private user: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Start social login flow
  startSocialLogin(provider: 'kakao' | 'naver') {
    const authUrl = `${SERVER_DOMAIN}/oauth2/authorization/${provider}?redirect_uri=${CLIENT_URL}/login/success`;
    window.location.href = authUrl;
  }

  // Get access token from server
  async getAccessToken(): Promise<string | null> {
    try {
      const response = await api.post('/auth/access-token', {}, { requiresAuth: false });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.accessToken;

        // Decode token to get user info
        if (this.accessToken) {
          this.user = this.decodeToken(this.accessToken);
        }

        return this.accessToken;
      }
      return null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  // Decode JWT token
  private decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as UserToken;
      const [provider, id] = payload.sub.split(':');

      return {
        id,
        provider,
        roles: payload.roles,
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.user;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.user;
  }

  // Get access token
  getToken(): string | null {
    return this.accessToken;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
      this.accessToken = null;
      this.user = null;
      window.location.href = CLIENT_URL;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await api.delete('/users');
      this.accessToken = null;
      this.user = null;
      window.location.href = CLIENT_URL;
    } catch (error) {
      console.error('Account deletion failed:', error);
    }
  }

  // Initialize auth state (check if already logged in)
  async initialize(): Promise<boolean> {
    if (import.meta.env.DEV) return true;
    const token = await this.getAccessToken();
    return !!token;
  }

  // Dev only: Manually set access token (for local development)
  setAccessTokenManually(token: string): void {
    if (import.meta.env.DEV) {
      console.log('[Auth] Manually setting access token');
      this.accessToken = token;
      this.user = this.decodeToken(token);
      console.log('[Auth] Manually set user:', this.user);
    }
  }
}

export const authService = AuthService.getInstance();
