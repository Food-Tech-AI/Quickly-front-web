'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { clientApi } from '@/lib/client-api';

interface Ingredient {
  ingredientId: number;
  quantity: number;
  unit: string;
  ingredient?: {
    id: number;
    name: string;
  };
}

interface Recipe {
  id: number;
  title: string;
  description?: string;
  instructions?: string;
  image?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  ingredients?: Ingredient[];
  category?: {
    id: number;
    name: string;
  };
  nutrition?: any;
  createdAt?: string;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recipeId = params?.id as string;

  useEffect(() => {
    async function fetchRecipe() {
      if (!recipeId) return;

      try {
        // Direct API call to external backend using axios (includes Bearer token automatically)
        const response = await clientApi.get(`/recipes-secondary/${recipeId}`);
        
        setRecipe(response.data);
      } catch (err: any) {
        console.error('Error fetching recipe:', err);
        
        if (err?.response?.status === 401) {
          router.push('/login?returnTo=/recipe-secondary/' + recipeId);
          return;
        }
        
        if (err?.response?.status === 404) {
          setError('Recipe not found');
        } else {
          setError(err.message || 'Failed to load recipe');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();
  }, [recipeId, router]);

  if (loading) {
    return (
      <main className="min-h-screen py-20 container mx-auto px-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="min-h-screen py-20 container mx-auto px-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-error font-medium mb-4">{error || 'Recipe not found'}</p>
          <Link
            href="/recipe"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-secondary transition-colors font-medium"
          >
            ← Back to Recipes
          </Link>
        </div>
      </main>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <main className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Back Button */}
        <Link
          href="/recipe"
          className="inline-flex items-center gap-2 text-textSecondary hover:text-primary mb-8 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Recipes
        </Link>

        {/* Recipe Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden shadow-xl">
            {recipe.image ? (
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover aspect-video"
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="text-9xl">🍳</span>
              </div>
            )}
          </div>

          {/* Recipe Info */}
          <div>
            <h1 className="text-4xl font-bold text-text mb-4">{recipe.title}</h1>
            {recipe.description && (
              <p className="text-textSecondary text-lg mb-6">{recipe.description}</p>
            )}

            {/* Meta Information */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {recipe.prepTime && (
                <div className="bg-surface rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-textLight mb-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Prep Time</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{recipe.prepTime} min</p>
                </div>
              )}
              {recipe.cookTime && (
                <div className="bg-surface rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-textLight mb-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                    <span className="text-sm">Cook Time</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{recipe.cookTime} min</p>
                </div>
              )}
              {recipe.servings && (
                <div className="bg-surface rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-textLight mb-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm">Servings</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{recipe.servings}</p>
                </div>
              )}
              {totalTime > 0 && (
                <div className="bg-surface rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 text-textLight mb-1">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm">Total Time</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{totalTime} min</p>
                </div>
              )}
            </div>

            {recipe.category && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <span>📁</span>
                {recipe.category.name}
              </div>
            )}
          </div>
        </div>

        {/* Ingredients & Instructions */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-text mb-4 flex items-center gap-2">
                <span>🥘</span>
                Ingredients
              </h2>
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <ul className="space-y-3">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-textSecondary">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        <span className="font-semibold text-text">
                          {ing.quantity} {ing.unit}
                        </span>{' '}
                        {ing.ingredient?.name || `Ingredient #${ing.ingredientId}`}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-textSecondary">No ingredients listed</p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-6">
              <h2 className="text-2xl font-bold text-text mb-6 flex items-center gap-2">
                <span>📝</span>
                Instructions
              </h2>
              {recipe.instructions ? (
                <div className="prose max-w-none">
                  <div className="text-textSecondary whitespace-pre-wrap leading-relaxed">
                    {recipe.instructions}
                  </div>
                </div>
              ) : (
                <p className="text-textSecondary">No instructions provided</p>
              )}
            </div>

            {/* Nutrition (if available) */}
            {recipe.nutrition && (
              <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 mt-6">
                <h2 className="text-2xl font-bold text-text mb-4 flex items-center gap-2">
                  <span>💪</span>
                  Nutrition Information
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(recipe.nutrition).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-sm text-textLight capitalize">{key}</p>
                      <p className="text-xl font-bold text-text">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
