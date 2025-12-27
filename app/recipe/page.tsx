'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clientApi } from '@/lib/client-api';

interface Recipe {
  id: number;
  title: string;
  description?: string;
  image?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  categoryId?: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function RecipePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const router = useRouter();

  const recipesPerPage = 12;

  // Fetch recipes with pagination on initial load and page change
  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        const response = await clientApi.get('/recipes-secondary/paginated', {
          params: {
            page: currentPage,
            limit: recipesPerPage
          }
        });
        
        const data = response.data;
        
        // Handle paginated response
        if (data.data && data.meta) {
          setRecipes(data.data);
          setPagination(data.meta);
        } else {
          // Fallback for non-paginated response
          const recipeList = Array.isArray(data) ? data : data.recipes || data.data || [];
          setRecipes(recipeList);
        }
      } catch (err: any) {
        console.error('Error fetching recipes:', err);
        
        if (err?.response?.status === 401) {
          router.push('/login?returnTo=/recipe');
          return;
        }
        
        setError(err.message || 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    }

    if (!searchQuery) {
      fetchRecipes();
    }
  }, [currentPage, router, searchQuery, recipesPerPage]);

  // Search recipes using backend API with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!searchQuery.trim()) {
        // Reset to page 1 when clearing search
        if (currentPage !== 1) {
          setCurrentPage(1);
        }
        return;
      }

      // Search using backend with pagination
      try {
        setSearching(true);
        const response = await clientApi.get('/recipes/paginated', {
          params: {
            page: currentPage,
            limit: recipesPerPage,
            search: searchQuery
          }
        });
        
        const data = response.data;
        if (data.data && data.meta) {
          setRecipes(data.data);
          setPagination(data.meta);
        } else {
          const recipeList = Array.isArray(data) ? data : data.recipes || data.data || [];
          setRecipes(recipeList);
          setPagination(null);
        }
      } catch (err: any) {
        console.error('Error searching recipes:', err);
        
        if (err?.response?.status === 401) {
          router.push('/login?returnTo=/recipe');
          return;
        }
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentPage, router, recipesPerPage]);

  if (loading) {
    return (
      <main className="min-h-screen py-20 container mx-auto px-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-textSecondary">Loading recipes...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen py-20 container mx-auto px-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-error font-medium mb-2">Error Loading Recipes</p>
          <p className="text-error/80 text-sm">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-text mb-3">My Recipes</h1>
            <p className="text-textSecondary text-lg">
              Browse and manage your personal recipe collection
            </p>
          </div>
          <Link 
            href="/recipe/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 gradient-button text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Recipe
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-textLight" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search recipes by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-surface text-text placeholder-textLight"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-textLight hover:text-text transition-colors"
                disabled={searching}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {searching && (
              <div className="absolute inset-y-0 right-12 pr-4 flex items-center pointer-events-none">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          {searchQuery && !searching && (
            <p className="mt-2 text-sm text-textSecondary">
              Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
          {searching && (
            <p className="mt-2 text-sm text-textSecondary">
              Searching...
            </p>
          )}
        </div>

        {/* Recipes Grid */}
        {recipes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Link 
                key={recipe.id} 
                href={`/recipe/${recipe.id}`}
                className="group bg-surface rounded-xl shadow-sm hover:shadow-xl border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                {/* Recipe Image */}
                {recipe.image ? (
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <span className="text-6xl">🍳</span>
                  </div>
                )}

                {/* Recipe Info */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-text mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {recipe.title}
                  </h3>
                  {recipe.description && (
                    <p className="text-textSecondary text-sm mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}

                  {/* Recipe Meta */}
                  <div className="flex items-center gap-4 text-xs text-textLight">
                    {recipe.prepTime && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{recipe.prepTime} min</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{recipe.servings} servings</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-xl shadow-sm border border-border p-12 text-center">
            {searchQuery ? (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-text mb-2">No Recipes Found</h3>
                <p className="text-textSecondary mb-6">
                  No recipes match your search "{searchQuery}". Try a different search term.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-secondary transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-text mb-2">No Recipes Yet</h3>
                <p className="text-textSecondary mb-6">
                  Start building your recipe collection by adding your first recipe!
                </p>
                <Link
                  href="/create-recipe"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-secondary transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Recipe
                </Link>
              </>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || searching}
              className="px-4 py-2 rounded-lg border border-border bg-surface text-text hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:text-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Show first page, last page, current page, and pages around current
                const showPage = 
                  pageNum === 1 || 
                  pageNum === pagination.totalPages || 
                  Math.abs(pageNum - currentPage) <= 1;
                
                const showEllipsis = 
                  (pageNum === 2 && currentPage > 3) ||
                  (pageNum === pagination.totalPages - 1 && currentPage < pagination.totalPages - 2);

                if (showEllipsis) {
                  return (
                    <span key={pageNum} className="px-2 text-textLight">
                      ...
                    </span>
                  );
                }

                if (!showPage) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={searching}
                    className={`min-w-[40px] px-3 py-2 rounded-lg border transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface text-text border-border hover:bg-primary/10 disabled:opacity-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages || searching}
              className="px-4 py-2 rounded-lg border border-border bg-surface text-text hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:text-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {pagination && (
          <div className="mt-4 text-center text-sm text-textSecondary">
            Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} recipes
          </div>
        )}
      </div>
    </main>
  );
}
