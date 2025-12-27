/**
 * Recipe-related TypeScript interfaces
 */

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Ingredient {
  id: number;
  name: string;
  category?: string;
}

export interface RecipeIngredient {
  id: number;
  quantity: number;
  unit: string;
  ingredient: Ingredient;
}

export interface Nutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  instructions?: string;
  image?: string;
  categoryId?: number;
  userId: number;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  nutrition?: Nutrition;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  ingredients?: RecipeIngredient[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedRecipesResponse {
  data: Recipe[];
  meta: PaginationMeta;
}
