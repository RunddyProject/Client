import { authService } from '../../features/auth/api/auth';

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

// Fetch wrapper that automatically adds JWT token to headers
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers = {}, ...restOptions } = options;

  const config: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    credentials: 'include' // Include cookies for refresh token
  };

  // Add Authorization header if auth is required
  if (requiresAuth) {
    const token = authService.getToken();
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] =
        `Bearer ${token}`;
    }
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${import.meta.env.VITE_SERVER_DOMAIN}${endpoint}`;

  const response = await fetch(url, config);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `API Error: ${response.status} ${response.statusText} ${body}`
    );
  }

  if (response.status === 204 || response.status === 205) {
    return null as T;
  }
  const raw = await response.text();
  if (!raw) {
    return null as T;
  }
  return JSON.parse(raw) as T;
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }),

  put: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }),

  delete: <T = any>(
    endpoint: string,
    data?: any,
    options?: ApiRequestOptions
  ) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined
    }),

  patch: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
};
