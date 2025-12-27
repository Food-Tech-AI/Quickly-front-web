import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Extract authentication token from request
 * Checks Authorization header first, then falls back to cookie
 */
export async function getAuthToken(request: NextRequest): Promise<string | null> {
  // Check Authorization header first (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  // Fallback to cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('ft_token')?.value;
  
  return token || null;
}

/**
 * Extract token from cookie header string
 * Used for regular Request objects (not NextRequest)
 */
export function getTokenFromCookieHeader(cookieHeader: string): string | null {
  const tokenMatch = cookieHeader.match(/ft_token=([^;]+)/);
  return tokenMatch?.[1] || null;
}

/**
 * Extract token from Request object
 * Checks Authorization header first, then cookie header
 */
export function getTokenFromRequest(request: Request): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie header
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    return getTokenFromCookieHeader(cookieHeader);
  }

  return null;
}

