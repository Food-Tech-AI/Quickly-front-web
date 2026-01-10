'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clientApi, api } from '@/lib/client-api';
import { Pagination } from '@/components/ui/pagination';

interface Category {
  id: number;
  name: string;
}

interface Recipe {
  id: number;
  title: string;
  description?: string;
  image?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  categoryId?: number;
  similarity?: number;
  categories?: Category[];
  category?: Category;
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
  const [searchDuration, setSearchDuration] = useState<number | null>(null);
  const [useAIReranking, setUseAIReranking] = useState(true);
  const [wasRerankedWithLLM, setWasRerankedWithLLM] = useState(false);
  const router = useRouter();
  const prevSearchQueryRef = useRef<string>('');

  const recipesPerPage = 12;

  // Fetch recipes with pagination on initial load and page change
  // NOTE: This is ONLY for loading all recipes when there's NO search query
  // ALL searches must use vector search endpoint, never paginated
  useEffect(() => {
    // CRITICAL: Never use paginated endpoint for search - only for initial load
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;
    if (hasSearchQuery) {
      // Don't fetch paginated data when searching - vector search handles it
      return;
    }
    
    async function fetchRecipes() {
      // Double check - never fetch paginated if search is active
      const stillHasSearch = searchQuery && searchQuery.trim().length > 0;
      if (stillHasSearch) {
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('[Load] Fetching page', currentPage, '- using paginated endpoint');
        const response = await clientApi.get('/recipes-secondary/paginated', {
          params: {
            page: currentPage,
            limit: recipesPerPage,
            sortBy: 'createdAt',
            sortOrder: 'DESC'
            // NOTE: No 'search' parameter - paginated endpoint should NEVER be used for search
          },
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
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

    fetchRecipes();
    // NOTE: searchQuery is in dependencies to prevent fetch when search is active
    // When searchQuery exists, this effect returns early and search effect handles it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, router, recipesPerPage]);

  // Search recipes using hybrid search (vector + text combined)
  // CRITICAL: This is the ONLY place where search happens
  // Uses /recipes-secondary/search/hybrid for best results
  useEffect(() => {
    const hasSearchQuery = searchQuery && searchQuery.trim().length > 0;
    const prevHadSearchQuery = prevSearchQueryRef.current && prevSearchQueryRef.current.trim().length > 0;
    
    // Update the ref for next comparison
    prevSearchQueryRef.current = searchQuery;
    
    // Don't search if query is empty
    if (!hasSearchQuery) {
      // Only reset to page 1 when clearing search (transitioning FROM search TO no search)
      // Don't reset if we're just on a different page without search
      if (prevHadSearchQuery && !hasSearchQuery) {
        setCurrentPage(1);
      }
      // Clear search results when transitioning from search to no search
      if (prevHadSearchQuery && !hasSearchQuery) {
        setRecipes([]);
        setPagination(null);
      }
      return;
    }

    console.log('[Search Effect] Search query detected:', searchQuery);
    console.log('[Search Effect] Using HYBRID SEARCH - /recipes-secondary/search/hybrid');
    
    const timeoutId = setTimeout(async () => {
      try {
        setSearching(true);
        setSearchDuration(null);
        setError(null);
        console.log('[Hybrid Search] Starting hybrid search for:', searchQuery);
        
        // CRITICAL: Always use hybrid search endpoint for best results
        const startTime = Date.now();
        console.log('[Hybrid Search] Calling /recipes-secondary/search/hybrid');
        
        try {
          const result = await api.vectorSearchRecipes(searchQuery, {
            limit: recipesPerPage,
            useLLM: useAIReranking,
          });
          
          console.log('[Hybrid Search] Response:', result);
          
          const duration = Date.now() - startTime;
          setSearchDuration(result.meta?.durationMs || duration);
          setWasRerankedWithLLM(result.meta?.rerankedWithLLM || false);
          
          // Handle different response structures
          let results: any[] = [];
          
          if (Array.isArray(result)) {
            // Direct array response
            results = result;
          } else if (result?.results && Array.isArray(result.results)) {
            // Standard hybrid search response
            results = result.results;
          }
          
          console.log('[Hybrid Search] Extracted results:', results.length);
          
          if (results.length > 0) {
            // Convert hybrid search results to Recipe format
            const recipeList = results.map((r: any) => ({
              id: r.id,
              title: r.title,
              description: r.description,
              image: r.image,
              prepTime: r.prepTime,
              cookTime: r.cookTime,
              servings: r.servings,
              // Use combinedScore from hybrid search (or fall back to similarity for backward compat)
              similarity: r.combinedScore || r.similarity || r.vectorScore || 0,
              categories: Array.isArray(r.categories) ? r.categories.map((cat: any) => 
                typeof cat === 'object' && cat !== null ? cat : { id: 0, name: cat }
              ) : [],
              category: r.category,
            }));
            
            console.log('[Hybrid Search] Mapped recipes:', recipeList.length);
            setRecipes(recipeList);
            setPagination({
              total: result.count || result.meta?.count || recipeList.length,
              page: 1,
              limit: recipesPerPage,
              totalPages: Math.ceil((result.count || result.meta?.count || recipeList.length) / recipesPerPage),
            });
          } else {
            console.log('[Hybrid Search] No results found. Full response:', result);
            setRecipes([]);
            setPagination(null);
          }
        } catch (searchError: any) {
          console.error('[Hybrid Search] Error:', searchError);
          console.error('[Hybrid Search] Error response:', searchError.response?.data);
          setError(searchError.response?.data?.message || searchError.message || 'Search failed');
          setRecipes([]);
          setPagination(null);
        }
      } catch (err: any) {
        console.error('Error searching recipes:', err);
        
        if (err?.response?.status === 401) {
          router.push('/login?returnTo=/recipe');
          return;
        }
        
        setError(err.message || 'Failed to search recipes');
        setRecipes([]);
        setPagination(null);
      } finally {
        setSearching(false);
      }
    }, 500); // Debounce for vector search

    return () => clearTimeout(timeoutId);
    // NOTE: This effect ONLY uses /recipes-secondary/search/vector
    // NEVER uses /recipes-secondary/paginated for search
    // NOTE: currentPage is NOT in dependencies to avoid conflicts with pagination
  }, [searchQuery, router, recipesPerPage, useAIReranking]);

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

        {/* Search Bar - Hybrid Search (AI + Text) */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-textLight" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search recipes semantically (e.g., 'healthy breakfast', 'quick dinner', 'chicken')..."
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
            
            {/* AI Reranking Toggle */}
            <div className="flex items-center gap-3 px-4 py-2 bg-surface border border-border rounded-xl">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAIReranking}
                  onChange={(e) => setUseAIReranking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-text">AI Reranking</span>
                <span className="text-xs text-textSecondary">
                  {useAIReranking ? 'Enhanced results with GPT' : 'Faster, basic ranking'}
                </span>
              </div>
            </div>
          </div>
          
          {searchQuery && !searching && (
            <div className="flex items-center gap-4 text-sm text-textSecondary mt-2">
              <p>
                Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </p>
              {searchDuration !== null && (
                <p className="text-xs">
                  (Search took {searchDuration}ms{wasRerankedWithLLM ? ' with AI reranking' : ''})
                </p>
              )}
            </div>
          )}
          {searching && (
            <p className="text-sm text-textSecondary mt-2">
              Searching{useAIReranking ? ' with AI reranking' : ''}...
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
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-xl text-text group-hover:text-primary transition-colors line-clamp-2 flex-1">
                      {recipe.title}
                    </h3>
                    {recipe.similarity !== undefined && (
                      <div className="flex-shrink-0 bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-semibold">
                        {(recipe.similarity * 100).toFixed(0)}% match
                      </div>
                    )}
                  </div>
                  {recipe.description && (
                    <p className="text-textSecondary text-sm mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                  
                  {/* Categories */}
                  {recipe.categories && recipe.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.categories.slice(0, 3).map((cat, idx) => (
                        <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {typeof cat === 'object' ? cat.name : cat}
                        </span>
                      ))}
                    </div>
                  )}
                  {recipe.category && !recipe.categories && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {typeof recipe.category === 'object' ? recipe.category.name : recipe.category}
                      </span>
                    </div>
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
        {pagination && pagination.totalPages > 1 && !searchQuery && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={searching || loading}
            />
            
            {/* Pagination Info */}
            <div className="mt-4 text-center text-sm text-textSecondary">
              Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} recipes
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
