'use client';

import { useState, useEffect, useRef } from 'react';
import { api, getClientErrorMessage } from '@/lib/client-api';
import { Recipe, PaginatedRecipesResponse } from '@/lib/types/recipe';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';

export default function MyRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const limit = 12;
  const router = useRouter();
  const prevSearchTermRef = useRef<string>('');

  // Fetch recipes with pagination (when no search term)
  useEffect(() => {
    // Only fetch if there's no search term
    // If search term was cleared, reset to page 1 first
    const hasNoSearch = !searchTerm || !searchTerm.trim().length;
    
    if (!hasNoSearch) {
      // If there's a search term, don't fetch paginated recipes
      prevSearchTermRef.current = searchTerm;
      return;
    }
    
    const prevHadSearch = prevSearchTermRef.current && prevSearchTermRef.current.trim().length > 0;
    
    // Only reset page when transitioning FROM search TO no search
    if (prevHadSearch && hasNoSearch && page !== 1) {
      prevSearchTermRef.current = searchTerm;
      setPage(1);
      return; // Will re-run with page=1
    }
    
    prevSearchTermRef.current = searchTerm;
    fetchRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm]);

  // Vector search with debounce (when search term exists)
  useEffect(() => {
    if (!searchTerm || !searchTerm.trim()) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      await handleVectorSearch();
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  async function fetchRecipes() {
    setLoading(true);
    setError(null);
    try {
      const data: PaginatedRecipesResponse = await api.getPaginatedRecipes({
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      setRecipes(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setHasNextPage(data.meta?.hasNextPage || false);
      setHasPreviousPage(data.meta?.hasPreviousPage || false);
    } catch (err: any) {
      const errorMsg = getClientErrorMessage(err);
      setError(errorMsg);
      
      // If unauthorized, redirect to login
      if (err?.response?.status === 401) {
        router.push('/login?returnTo=/myrecipes');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVectorSearch() {
    setSearching(true);
    setError(null);
    try {
      const result = await api.vectorSearchRecipes(searchTerm, {
        limit: limit,
      });

      let results: any[] = [];
      if (Array.isArray(result)) {
        results = result;
      } else if (result?.results && Array.isArray(result.results)) {
        results = result.results;
      }

      const recipeList = results.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        image: r.image,
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        servings: r.servings,
        // Use combinedScore from hybrid search (or fall back to similarity for backward compat)
        similarity: r.combinedScore || r.similarity || r.vectorScore || 0,
        category: r.category,
        categories: Array.isArray(r.categories) ? r.categories.map((cat: any) => 
          typeof cat === 'object' && cat !== null ? cat : { id: 0, name: cat }
        ) : [],
        nutrition: r.nutrition,
        userId: r.userId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

      setRecipes(recipeList);
      // For search, we don't have pagination
      setTotalPages(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
    } catch (err: any) {
      const errorMsg = getClientErrorMessage(err);
      setError(errorMsg);
      
      if (err?.response?.status === 401) {
        router.push('/login?returnTo=/myrecipes');
      }
    } finally {
      setSearching(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchTerm && searchTerm.trim()) {
      handleVectorSearch();
    }
  }

  function handleLogout() {
    api.logout()
      .then(() => {
        router.push('/login');
      })
      .catch((err) => {
        console.error('Logout error:', err);
        router.push('/login');
      });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">
            My Recipes
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-textSecondary hover:text-primary transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search recipes semantically (e.g., 'healthy breakfast', 'quick dinner')..."
                className="flex-1 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 gradient-button text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 max-w-2xl mx-auto bg-red-50 border border-error/30 text-error px-4 py-3 rounded-xl">
            <p className="font-medium">Error loading recipes</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {(loading || searching) && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="ml-4 text-textSecondary">
              {searching ? 'Searching recipes...' : 'Loading recipes...'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !searching && !error && recipes.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍳</div>
            <h2 className="text-2xl font-semibold text-text mb-2">No recipes found</h2>
            <p className="text-textSecondary">
              {searchTerm
                ? 'Try adjusting your search term'
                : 'Start by creating your first recipe!'}
            </p>
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && !searching && recipes.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => router.push(`/recipe/${recipe.id}`)}
                  className="bg-surface rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer border border-border"
                >
                  {/* Recipe Image */}
                  <div className="relative h-48 gradient-primary overflow-hidden">
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🍽️
                      </div>
                    )}
                    {recipe.categories && recipe.categories.length > 0 && (
                      <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-text">
                        {typeof recipe.categories[0] === 'object' ? recipe.categories[0].name : recipe.categories[0]}
                      </div>
                    )}
                    {recipe.category && !recipe.categories && (
                      <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-text">
                        {typeof recipe.category === 'object' ? recipe.category.name : recipe.category}
                      </div>
                    )}
                  </div>

                  {/* Recipe Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-text mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-textSecondary mb-4 line-clamp-2">
                      {recipe.description}
                    </p>

                    {/* Recipe Meta */}
                    <div className="flex items-center gap-4 text-xs text-textLight">
                      {recipe.prepTime && (
                        <div className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{recipe.prepTime} min</span>
                        </div>
                      )}
                      {recipe.servings && (
                        <div className="flex items-center gap-1">
                          <span>👥</span>
                          <span>{recipe.servings} servings</span>
                        </div>
                      )}
                    </div>

                    {/* Nutrition Info */}
                    {recipe.nutrition && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex justify-between text-xs text-textSecondary">
                          {recipe.nutrition.calories && (
                            <span>🔥 {recipe.nutrition.calories} cal</span>
                          )}
                          {recipe.nutrition.protein && (
                            <span>💪 {recipe.nutrition.protein}g protein</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !searchTerm && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(newPage) => {
                    setPage(newPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={loading || searching}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
