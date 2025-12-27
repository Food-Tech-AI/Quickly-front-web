// Auth related TypeScript types

export interface LoginRequest {
  identifier: string; // Your backend uses "identifier" instead of "email"
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken?: string;
  access_token?: string;
  token?: string;
  authToken?: string;
  data?: {
    token?: string;
    user?: User;
  };
  user?: User;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  [key: string]: any;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
  error?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
}
