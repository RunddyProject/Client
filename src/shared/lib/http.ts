import { authService } from '../../features/user/api/auth';

type ResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer';

interface ApiRequestOptions extends RequestInit {
  responseType?: ResponseType;
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  body?: string;

  constructor(status: number, statusText: string, body?: string) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Fetch wrapper that automatically adds JWT token to headers
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { headers = {}, responseType = 'json', ...restOptions } = options;

  const config: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    credentials: 'include' // Include cookies for refresh token
  };

  const token = authService.getToken();
  if (token) {
    (config.headers as Record<string, string>)['Authorization'] =
      `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${import.meta.env.VITE_SERVER_DOMAIN}${endpoint}`;

  const response = await fetch(url, config);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new ApiError(response.status, response.statusText, body);
  }

  if (response.status === 204 || response.status === 205) {
    return null as T;
  }

  if (responseType === 'blob') {
    const blob = await response.blob();
    const filename = getFilenameFromContentDisposition(
      response.headers.get('content-disposition')
    );
    return { blob, filename } as T;
  }

  if (responseType === 'arrayBuffer') {
    const buffer = await response.arrayBuffer();
    return buffer as T;
  }

  if (responseType === 'text') {
    const text = await response.text();
    return (text || null) as T;
  }

  // default: json
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
    }),

  getBlob: (endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<{ blob: Blob; filename?: string }>(endpoint, {
      ...options,
      method: 'GET',
      responseType: 'blob'
    }),

  download: async (
    endpoint: string,
    opts?: ApiRequestOptions & { fallbackName?: string }
  ) => {
    const { fallbackName, ...options } = opts || {};
    const { blob, filename } = await api.getBlob(endpoint, options);
    const finalName = filename || fallbackName || 'download';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
};

function getFilenameFromContentDisposition(cd?: string | null) {
  if (!cd) return undefined;
  const star = /filename\*\s*=\s*([^'"]*)''([^;]+)/i.exec(cd);
  if (star?.[2]) return decodeURIComponent(star[2]);
  const normal = /filename\s*=\s*"?([^";]+)"?/i.exec(cd);
  return normal?.[1];
}
