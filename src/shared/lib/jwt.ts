export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: unknown;
}

export function decodeJwt<T extends JwtPayload = JwtPayload>(
  token: string
): T | null {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded) as T;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function isJwtExpired(token: string, bufferSeconds = 10): boolean {
  try {
    const payload = decodeJwt(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp <= currentTime + bufferSeconds;
  } catch (error) {
    console.error('Failed to check JWT expiration:', error);
    return true;
  }
}

export function getJwtExpiration(token: string): Date | null {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) {
    return null;
  }
  return new Date(payload.exp * 1000);
}
