/**
 * JWT utility functions
 */

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

/**
 * Decodes a JWT token without verification
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if decoding fails
 */
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

/**
 * Checks if a JWT token is expired
 * @param token - The JWT token to check
 * @param bufferSeconds - Optional buffer in seconds to consider token expired early (default: 10)
 * @returns true if the token is expired, false otherwise
 */
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

/**
 * Gets the expiration time of a JWT token
 * @param token - The JWT token
 * @returns The expiration time as a Date object, or null if not available
 */
export function getJwtExpiration(token: string): Date | null {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) {
    return null;
  }
  return new Date(payload.exp * 1000);
}
