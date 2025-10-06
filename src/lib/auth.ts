import { api } from '@/lib/api/api';

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
  userName?: string;
  profileUrl?: string;
}

const SERVER_DOMAIN = import.meta.env.VITE_SERVER_DOMAIN;
const CLIENT_URL = import.meta.env.VITE_CLIENT_URL;

export class AuthService {
  private static instance: AuthService;
  private readonly TOKEN_KEY = 'runddy_access_token';

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Storage helpers
  private readToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (e) {
      console.error('[Auth] Failed to read token:', e);
      return null;
    }
  }

  private writeToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      console.log('[Auth] Saved token to localStorage');
    } catch (e) {
      console.error('[Auth] Failed to save token:', e);
    }
  }

  private clearToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      console.log('[Auth] Removed token from localStorage');
    } catch (e) {
      console.error('[Auth] Failed to remove token:', e);
    }
  }

  // OAuth redirect
  startSocialLogin(provider: 'kakao' | 'naver') {
    const authUrl = `${SERVER_DOMAIN}/oauth2/authorization/${provider}?redirect_uri=${CLIENT_URL}/login/success`;
    window.location.href = authUrl;
  }

  // Get access token from server
  async getAccessToken(): Promise<string | null> {
    try {
      const res = await api.post<{ accessToken: string }>('/auth/access-token', undefined, { requiresAuth: false });

      if (!res?.accessToken) return null;

      this.writeToken(res.accessToken);
      return res.accessToken;
    } catch (error) {
      console.error('[Auth] Failed to get access token:', error);
      this.clearToken();
      return null;
    }
  }

  // Decode JWT token
  private decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as UserToken;
      const [provider, id] = payload.sub.split(':');
      return { id, provider, roles: payload.roles };
    } catch (error) {
      console.error('[Auth] Failed to decode token:', error);
      return null;
    }
  }

  // Public getters
  isAuthenticated(): boolean {
    const token = this.readToken();
    if (!token) return false;
    const user = this.decodeToken(token);
    return !!user;
  }

  getCurrentUser(): User | null {
    const token = this.readToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  getToken(): string | null {
    return this.readToken();
  }

  // Logout / Delete
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('[Auth] Logout API failed (continuing):', e);
    } finally {
      this.clearToken();
      window.location.href = CLIENT_URL;
    }
  }

  async deleteAccount(data: string[]): Promise<void> {
    try {
      await api.delete('/users', { reasonList: data });
    } catch (e) {
      console.error('[Auth] Account deletion API failed (continuing):', e);
    } finally {
      this.clearToken();
      window.location.href = CLIENT_URL;
    }
  }

  // Initialize auth state (check if already logged in)
  async initialize(): Promise<boolean> {
    if (import.meta.env.DEV) return true;

    // 1) check storage
    const existing = this.readToken();
    if (existing && this.decodeToken(existing)) {
      return true;
    }

    // 2) update token
    const token = await this.getAccessToken();
    return !!token;
  }

  // DEV only
  setAccessTokenManually(token: string): void {
    if (import.meta.env.DEV) {
      console.log('[Auth] Manually setting access token');
      this.writeToken(token);
      console.log('[Auth] Manually set user:', this.decodeToken(token));
    }
  }
}

export const authService = AuthService.getInstance();
