import { api } from '@/shared/lib/http';
import { decodeJwt, isJwtExpired, type JwtPayload } from '@/shared/lib/jwt';

export interface UserToken extends JwtPayload {
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

  // localStorage helpers
  private readToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (e) {
      console.error('[Auth] Failed to read token:', e);
      return null;
    }
  }

  private writeToken(token: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (e) {
      console.error('[Auth] Failed to save token:', e);
    }
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (e) {
      console.error('[Auth] Failed to remove token:', e);
    }
  }

  // Social login redirect
  startSocialLogin(provider: 'kakao' | 'naver') {
    const authUrl = `${SERVER_DOMAIN}/oauth2/authorization/${provider}?redirect_uri=${CLIENT_URL}/login/success`;
    window.location.href = authUrl;
  }

  // Get access token from server
  async getAccessToken(): Promise<string | null> {
    try {
      const res = await api.post<{
        accessToken?: string;
        token?: string;
        data?: { accessToken?: string };
      }>('/auth/access-token', undefined);
      const token = res?.accessToken || res?.token || res?.data?.accessToken;
      if (!token) throw new Error('No accessToken found in response');

      this.writeToken(token);
      return token;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        console.warn('[Auth] getAccessToken 401 - session expired');
      } else {
        console.error('[Auth] Failed to get access token:', error);
      }
      this.clearToken();
      return null;
    }
  }

  // Decode JWT
  private decodeToken(token: string): User | null {
    const payload = decodeJwt<UserToken>(token);
    if (!payload || !payload.sub) {
      return null;
    }

    const [provider, id] = payload.sub.split(':');
    if (!provider || !id) {
      return null;
    }

    return { id, provider, roles: payload.roles };
  }

  // Check if token is expired
  private isTokenExpired(token: string): boolean {
    return isJwtExpired(token, 10);
  }

  // Public getters
  getToken(): string | null {
    return this.readToken();
  }

  getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) return null;
    return this.decodeToken(token);
  }

  private async checkAuthOnServer(): Promise<boolean> {
    const token = this.getToken();
    if (!token || this.isTokenExpired(token) || !this.decodeToken(token)) {
      if (token && this.isTokenExpired(token)) {
        console.warn('[Auth] Token expired, clearing');
        this.clearToken();
      }
      return false;
    }

    try {
      await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
        // cache: 'no-store',
      });
      return true;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        console.warn('[Auth] checkAuthOnServer 401');
        this.clearToken();
      } else {
        console.error('[Auth] checkAuthOnServer failed:', error);
      }
      return false;
    }
  }

  async getUser(): Promise<User | null> {
    const token = this.getToken();
    const local = this.getUserFromToken();
    if (!token || !local) return null;

    try {
      const res = await api.get<{
        userName?: string;
        profileUrl?: string;
      }>('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return {
        id: local.id,
        provider: local.provider,
        roles: local.roles,
        userName: res?.userName,
        profileUrl: res?.profileUrl
      };
    } catch (error: any) {
      if (error?.response?.status === 401) this.clearToken();
      return null;
    }
  }

  async isAuthenticated(opts?: { validate?: boolean }): Promise<boolean> {
    const { validate = false } = opts ?? {};
    const token = this.getToken();
    if (!token || this.isTokenExpired(token) || !this.decodeToken(token)) {
      if (token && this.isTokenExpired(token)) {
        this.clearToken();
      }
      return false;
    }
    if (!validate) return true;
    return this.checkAuthOnServer();
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('[Auth] Logout API failed (continuing):', e);
    } finally {
      this.clearToken();
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

  async initialize(): Promise<boolean> {
    if (import.meta.env.DEV) {
      const t = this.getToken();
      return !!(t && this.decodeToken(t) && !this.isTokenExpired(t));
    }
    const existing = this.getToken();
    // Check if token exists, is valid, and not expired
    const isValidToken =
      existing && this.decodeToken(existing) && !this.isTokenExpired(existing);

    if (!isValidToken) {
      // Token is missing, invalid, or expired - get new token from server
      const newToken = await this.getAccessToken();
      if (!newToken) return false;
    }
    return this.isAuthenticated({ validate: true });
  }

  // DEV only
  setAccessTokenManually(token: string): void {
    if (import.meta.env.DEV) {
      this.writeToken(token);
      console.log('[Auth] Manually set token');
    }
  }
}

export const authService = AuthService.getInstance();
