import axios from 'axios';
import { PaginatedRecipesResponse, Recipe } from './types/recipe';

/**
 * Client-side API client for making requests directly to the backend API
 * Use this in 'use client' components
 */

// Backend API URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

// Token management
const TOKEN_KEY = 'auth_token';

export const tokenManager = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  },
};

// Create axios instance for client-side requests directly to backend
export const clientApi = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests (for CORS)
});

// Request interceptor - Add Bearer token
clientApi.interceptors.request.use(
  (config) => {
    // Add Bearer token if available
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Auth] Adding Bearer token to request:', config.url);
      console.log('[Auth] Token (first 20 chars):', token.substring(0, 20) + '...');
    } else {
      console.log('[Auth] No token found in localStorage for request:', config.url);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Client API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
clientApi.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Client API] ${response.status} - ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`[Client API Error] ${error.response.status} - ${error.config?.url}`);
      
      // Handle 401 - Unauthorized (clear token and redirect to login)
      if (error.response.status === 401) {
        tokenManager.removeToken();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?returnTo=' + window.location.pathname;
        }
      }
    } else {
      console.error('[Client API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Helper function to extract error message from axios error
 */
export function getClientErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.response?.data?.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * API Helper Functions
 */

export const api = {
  /**
   * Login user
   */
  login: async (identifier: string, password: string) => {
    const response = await clientApi.post('/auth/login', { 
      identifier, 
      password 
    });
    
    console.log('Full login response:', response);
    console.log('Response headers:', response.headers);
    console.log('Response data:', response.data);
    
    // Try to extract token from multiple possible locations
    let token = response.data?.accessToken || 
                response.data?.access_token || 
                response.data?.token ||
                response.headers?.authorization?.replace('Bearer ', '');
    
    // If token is in Set-Cookie header, try to extract it
    if (!token && response.headers?.['set-cookie']) {
      const setCookie = response.headers['set-cookie'];
      const tokenMatch = setCookie.find((cookie: string) => cookie.startsWith('ft_token='));
      if (tokenMatch) {
        token = tokenMatch.split('=')[1].split(';')[0];
      }
    }
    
    if (token) {
      console.log('Token found, saving to localStorage:', token.substring(0, 20) + '...');
      tokenManager.setToken(token);
    } else {
      console.warn('No token found in response. Response data:', response.data);
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const response = await clientApi.post('/auth/logout');
      return response.data;
    } finally {
      // Always clear token even if API call fails
      tokenManager.removeToken();
    }
  },

  /**
   * Check session
   */
  checkSession: async () => {
    const response = await clientApi.get('/auth/session');
    return response.data;
  },

  /**
   * Get recipes
   */
  getRecipes: async (limit: number = 10): Promise<Recipe[]> => {
    const response = await clientApi.get('/recipes', { params: { limit } });
    return response.data;
  },

  /**
   * Get paginated recipes with search and filters
   */
  getPaginatedRecipes: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    sortBy?: 'title' | 'createdAt' | 'updatedAt';
    sortOrder?: 'ASC' | 'DESC';
  } = {}): Promise<PaginatedRecipesResponse> => {
    const response = await clientApi.get('/recipes-secondary/paginated', { params });
    return response.data;
  },

  /**
   * Search recipes
   */
  searchRecipes: async (search: string, category?: string): Promise<Recipe[]> => {
    const response = await clientApi.get('/recipes-secondary/search', { 
      params: { search, category } 
    });
    return response.data;
  },

  /**
   * Get single recipe by ID
   */
  getRecipeById: async (id: number): Promise<Recipe> => {
    const response = await clientApi.get(`/recipes-secondary/${id}`);
    return response.data;
  },

  /**
   * Get categories
   */
  getCategories: async () => {
    const response = await clientApi.get('/categories');
    return response.data;
  },

  /**
   * Get ingredients with pagination
   */
  getIngredients: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}) => {
    const response = await clientApi.get('/ingredients', { params });
    return response.data;
  },

  /**
   * Create new ingredient
   */
  createIngredient: async (data: {
    name: string;
    description?: string;
    unit: string;
    categoryId?: number;
  }) => {
    const response = await clientApi.post('/ingredients', data);
    return response.data;
  },

  /**
   * Create new recipe
   */
  createRecipe: async (data: any) => {
    const response = await clientApi.post('/recipes-secondary', data);
    return response.data;
  },
};
