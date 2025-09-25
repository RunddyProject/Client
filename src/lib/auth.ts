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
    const authUrl = `${SERVER_DOMAIN}/oauth2/authorization/${provider}?redirect_uri=${CLIENT_URL}/`;
    window.location.href = authUrl;
  }

  // Get access token from server
  async getAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(`${SERVER_DOMAIN}/auth/access-token`, {
        method: 'POST',
        credentials: 'include', // Include HttpOnly cookies
      });

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
      await fetch(`${SERVER_DOMAIN}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      this.accessToken = null;
      this.user = null;
    }
  }

  // Initialize auth state (check if already logged in)
  async initialize(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}

export const authService = AuthService.getInstance();
