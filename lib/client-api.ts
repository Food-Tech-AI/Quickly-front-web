import axios from 'axios';
import { PaginatedRecipesResponse, Recipe } from './types/recipe';

/**
 * Client-side API client for making requests directly to the backend API
 * Use this in 'use client' components
 */

// Backend API URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://extractquickly.com/api';

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
    'Cache-Control': 'no-cache',
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
      // console.error(`[Client API Error] ${error.response.status} - ${error.config?.url}`);
      
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
   * Search recipes (basic text search)
   */
  searchRecipes: async (search: string, category?: string): Promise<Recipe[]> => {
    const response = await clientApi.get('/recipes-secondary/search', { 
      params: { search, category } 
    });
    return response.data;
  },

  /**
   * Hybrid search recipes (combines vector similarity + text search for best results)
   * Uses the hybrid endpoint which gives better results than pure vector search
   * Now supports LLM reranking for even better semantic understanding
   */
  vectorSearchRecipes: async (query: string, options?: {
    limit?: number;
    minSimilarity?: number;
    includeCategories?: boolean;
    includeIngredients?: boolean;
    vectorWeight?: number;
    textWeight?: number;
    useLLM?: boolean;
  }): Promise<{
    success: boolean;
    query: string;
    count: number;
    meta: {
      vectorWeight: number;
      textWeight: number;
      durationMs: number;
      rerankedWithLLM?: boolean;
    };
    results: Array<{
      id: number;
      title: string;
      description?: string;
      image?: string;
      vectorScore: number;
      textScore: number;
      combinedScore: number;
      matchType: 'hybrid' | 'vector' | 'text';
      categories: string[];
      prepTime?: number;
      cookTime?: number;
      servings?: number;
      canonical_title?: string;
      canonical_ingredients?: string[];
      // LLM reranking fields (only present when useLLM=true)
      llmScore?: number;
      llmReasoning?: string;
      finalScore?: number;
      reranked?: boolean;
    }>;
  }> => {
    console.log('[API] Hybrid search request:', {
      query,
      options,
      url: '/recipes-secondary/search/hybrid'
    });
    
    try {
      const response = await clientApi.get('/recipes-secondary/search/hybrid', {
        params: {
          q: query,
          limit: options?.limit || 10,
          vectorWeight: options?.vectorWeight || 0.5,
          textWeight: options?.textWeight || 0.5,
          useLLM: options?.useLLM ?? true,  // Enable LLM reranking by default
        },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('[API] Hybrid search response:', {
        status: response.status,
        data: response.data,
        resultsCount: response.data?.results?.length || 0
      });
      
      return response.data;
    } catch (error: any) {
      console.error('[API] Hybrid search error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Fallback to quick search if hybrid fails
      console.log('[API] Falling back to quick search...');
      try {
        const fallbackResponse = await clientApi.get('/recipes-secondary/search/quick', {
          params: {
            q: query,
            limit: options?.limit || 10,
          }
        });
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('[API] Quick search fallback also failed:', fallbackError);
        throw error; // Throw original error
      }
    }
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
   * Get categories from secondary DB with recipe counts
   */
  getCategoriesWithCounts: async (): Promise<Array<{
    id: number;
    name: string;
    recipeCount: number;
  }>> => {
    const response = await clientApi.get('/categories-secondary/with-counts');
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

  /**
   * Generate image for recipe
   * Timeout: 2 minutes (120 seconds) for AI image generation
   */
  generateRecipeImage: async (recipeId: number): Promise<any> => {
    const response = await clientApi.post(
      `/recipes-secondary/${recipeId}/generate-image`,
      {},
      {
        timeout: 120000, // 2 minutes timeout
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  /**
   * Match recipe ingredients to e-commerce products
   * Uses AI-powered vector search + GPT ranking
   */
  matchIngredientsToProducts: async (ingredients: Array<{
    name_fr: string;
    quantity: number;
    unit: string;
    ingredient_id?: number;
  }>, options?: {
    top_k?: number;
    use_gpt_ranking?: boolean;
  }): Promise<{
    matches: Array<{
      ingredient_name: string;
      ingredient_id?: number;
      requested_quantity: number;
      requested_unit: string;
      ranked_products: Array<{
        id: number;
        label: string;
        brand?: string | null;
        category?: string | null;
        image?: string | null;
        product_weight?: number | null;
        product_unit?: string | null;
        price?: number | null;
        currency?: string | null;
        similarity_score: number;
        rank: number;
        quantity_to_buy: number;
        match_reason: string;
      }>;
    }>;
    total_ingredients: number;
    total_products_matched: number;
  }> => {
    const response = await clientApi.post(
      '/ecommerce-products/match-ingredients',
      {
        ingredients,
        top_k: options?.top_k || 3,
        use_gpt_ranking: options?.use_gpt_ranking !== false,
      },
      {
        timeout: 60000, // 1 minute timeout for AI processing
      }
    );
    return response.data;
  },
};
