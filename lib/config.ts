/**
 * Application Configuration
 * Centralized configuration for API endpoints and environment variables
 */

// Get backend URL from environment variables
// In server components/API routes: process.env.BACKEND_URL
// In client components: process.env.NEXT_PUBLIC_BACKEND_URL
export const getBackendUrl = (): string => {
  // Server-side (API routes, SSR)
  if (typeof window === 'undefined') {
    return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  }
  
  // Client-side
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
};

export const config = {
  // Backend API URL
  backendUrl: getBackendUrl(),
  
  // API Timeout
  apiTimeout: 30000,
  
  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Frontend URL (for redirects, etc)
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001',
} as const;

export default config;

