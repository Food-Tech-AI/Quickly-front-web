import axios, { AxiosError, AxiosInstance } from 'axios';
import { config } from './config';

const BACKEND_URL = config.backendUrl;

if (config.isDevelopment) {
  console.log('[Axios Config] Backend URL:', BACKEND_URL);
}

// Create axios instance for server-side API calls (API routes only)
export const apiClient: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 500,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      console.error(`[API Error] ${error.response.status} - ${error.config?.url}`, error.response.data);
    } else if (error.request) {
      console.error('[API Error] No response received', error.message);
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to extract error message
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.response?.data?.error || error.message;
    return message || 'An unexpected error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
