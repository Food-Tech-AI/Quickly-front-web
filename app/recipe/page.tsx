'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clientApi, api } from '@/lib/client-api';
import { Pagination } from '@/components/ui/pagination';

interface CategoryWithCount {
  id: number;
  name: string;
  recipeCount: number;
}

interface Category {
  id: number;
  name: string;
}

interface Recipe {
  id: number;
  title: string;
  title_fr?: string;
  description?: string;
  description_fr?: string;
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
  const [useAIReranking, setUseAIReranking] = useState(false);
  const [wasRerankedWithLLM, setWasRerankedWithLLM] = useState(false);
  
  // Category filter state
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const prevSearchQueryRef = useRef<string>('');

  const recipesPerPage = 12;

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoadingCategories(true);
        const data = await api.getCategoriesWithCounts();
        // Sort by recipe count (descending) and filter out categories with 0 recipes
        const sortedCategories = data
          .filter(cat => cat.recipeCount > 0)
          .sort((a, b) => b.recipeCount - a.recipeCount);
        setCategories(sortedCategories);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        // Don't show error for categories, just hide the filter
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Close category dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
        setCategorySearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        console.log('[Load] Fetching page', currentPage, '- using paginated endpoint', selectedCategory ? `with category ${selectedCategory}` : '');
        const response = await clientApi.get('/recipes-secondary/paginated', {
          params: {
            page: currentPage,
            limit: recipesPerPage,
            sortBy: 'createdAt',
            sortOrder: 'DESC',
            categoryId: selectedCategory || undefined,
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
          setRecipes(data.data.filter((r: Recipe) => r.image));
          setPagination(data.meta);
        } else {
          // Fallback for non-paginated response
          const recipeList = Array.isArray(data) ? data : data.recipes || data.data || [];
          setRecipes(recipeList.filter((r: Recipe) => r.image));
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
  }, [currentPage, searchQuery, selectedCategory, router, recipesPerPage]);

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
              title_fr: r.title_fr,
              description: r.description,
              description_fr: r.description_fr,
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
            
            const recipesWithImages = recipeList.filter((r: Recipe) => r.image);
            console.log('[Hybrid Search] Mapped recipes:', recipesWithImages.length);
            setRecipes(recipesWithImages);
            // For search results, total is the number of results returned
            // (hybrid search doesn't provide a total count, just the results)
            const totalCount = (result as any).count || recipeList.length;
            setPagination({
              total: totalCount,
              page: 1,
              limit: recipesPerPage,
              totalPages: Math.ceil(totalCount / recipesPerPage),
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
      <main className="min-h-screen pt-28 pb-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary mb-4"></div>
            <p className="text-textSecondary text-sm">Chargement des recettes...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen pt-28 pb-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center max-w-lg mx-auto">
            <div className="text-4xl mb-3">😕</div>
            <p className="text-red-600 font-semibold mb-1">Erreur de chargement</p>
            <p className="text-red-500/80 text-sm">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-16 bg-background">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/[0.08] rounded-full mb-4">
              <span className="text-sm">📖</span>
              <span className="text-xs font-semibold text-primary tracking-wide uppercase">Collection</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-text mb-2 tracking-tight">Mes Recettes</h1>
            <p className="text-textSecondary text-[15px]">
              Parcourez et gérez votre collection de recettes
            </p>
          </div>
          <Link 
            href="/recipe/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/15 transition-all duration-200 text-sm shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Créer une recette
          </Link>
        </div>

        {/* Search Bar - Hybrid Search (AI + Text) */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-textLight" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher des recettes (ex: 'petit-déjeuner sain', 'dîner rapide')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all bg-white text-text placeholder-textLight text-sm"
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
            {/* <div className="flex items-center gap-3 px-4 py-2 bg-surface border border-border rounded-xl">
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
            </div> */}
          </div>
          
          {searchQuery && !searching && (
            <div className="flex items-center gap-4 text-sm text-textSecondary mt-2">
              <p>
                {recipes.length} recette{recipes.length !== 1 ? 's' : ''} trouvée{recipes.length !== 1 ? 's' : ''} pour "{searchQuery}"
              </p>
              {searchDuration !== null && (
                <p className="text-xs">
                  (Recherche en {searchDuration}ms{wasRerankedWithLLM ? ' avec reclassement IA' : ''})
                </p>
              )}
            </div>
          )}
          {searching && (
            <p className="text-sm text-textSecondary mt-2">
              Recherche en cours{useAIReranking ? ' avec reclassement IA' : ''}...
            </p>
          )}
        </div>

        {/* Category Filter - Searchable Dropdown */}
        {!searchQuery && categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Label */}
              <span className="text-sm font-medium text-textSecondary whitespace-nowrap">
                Filtrer par catégorie :
              </span>
              
              {/* Dropdown */}
              <div className="relative flex-1 max-w-md" ref={categoryDropdownRef}>
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-border/50 rounded-xl hover:border-primary/30 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">{selectedCategory ? '🏷️' : '🍽️'}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-text truncate">
                        {selectedCategory
                          ? categories.find(c => c.id === selectedCategory)?.name || 'Catégorie'
                          : 'Toutes les recettes'}
                      </p>
                      <p className="text-xs text-textSecondary">
                        {selectedCategory
                          ? `${categories.find(c => c.id === selectedCategory)?.recipeCount || 0} recettes`
                          : `${pagination?.total || 0} recettes au total`}
                      </p>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {categoryDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-border/30 rounded-2xl shadow-xl shadow-black/[0.08] overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <svg
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          placeholder="Rechercher une catégorie..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-border/40 rounded-xl focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-72 overflow-y-auto">
                      {/* All Recipes Option */}
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          setCurrentPage(1);
                          setCategoryDropdownOpen(false);
                          setCategorySearch('');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          selectedCategory === null
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">🍽️</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">Toutes les recettes</p>
                          <p className="text-xs text-textSecondary">{pagination?.total || 0} recettes</p>
                        </div>
                        {selectedCategory === null && (
                          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>

                      {/* Divider */}
                      <div className="h-px bg-gray-100 mx-4" />

                      {/* Filtered Categories */}
                      {categories
                        .filter(cat =>
                          cat.name.toLowerCase().includes(categorySearch.toLowerCase())
                        )
                        .map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              setSelectedCategory(category.id);
                              setCurrentPage(1);
                              setCategoryDropdownOpen(false);
                              setCategorySearch('');
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                              selectedCategory === category.id
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-lg">🏷️</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{category.name}</p>
                              <p className="text-xs text-textSecondary">{category.recipeCount} recettes</p>
                            </div>
                            {selectedCategory === category.id && (
                              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}

                      {/* No Results */}
                      {categorySearch &&
                        categories.filter(cat =>
                          cat.name.toLowerCase().includes(categorySearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-8 text-center text-textSecondary text-sm">
                            Aucune catégorie trouvée pour "{categorySearch}"
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick clear button when category is selected */}
              {selectedCategory && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setCurrentPage(1);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Effacer le filtre
                </button>
              )}
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        {recipes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map((recipe) => (
              <Link 
                key={recipe.id} 
                href={`/recipe/${recipe.id}`}
                className="group bg-white rounded-2xl border border-border/30 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/[0.06] hover:border-primary/15"
              >
                {/* Recipe Image */}
                {recipe.image ? (
                  <div className="aspect-[16/10] bg-gray-50 overflow-hidden">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-gradient-to-br from-primary/[0.06] to-secondary/[0.06] flex items-center justify-center">
                    <span className="text-5xl">🍳</span>
                  </div>
                )}

                {/* Recipe Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-[17px] text-text group-hover:text-primary transition-colors duration-200 line-clamp-2 flex-1 leading-snug">
                      {recipe.title_fr || recipe.title}
                    </h3>
                    {/* {recipe.similarity !== undefined && (
                      <div className="flex-shrink-0 bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-semibold">
                        {(recipe.similarity * 100).toFixed(0)}% match
                      </div>
                    )} */}
                  </div>
                  {(recipe.description_fr || recipe.description) && (
                    <p className="text-textLight text-sm mb-3 line-clamp-2 leading-relaxed">
                      {recipe.description_fr || recipe.description}
                    </p>
                  )}
                  
                  {/* Categories */}
                  {recipe.categories && recipe.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {recipe.categories.slice(0, 3).map((cat, idx) => (
                        <span key={idx} className="text-[11px] font-medium bg-primary/[0.07] text-primary/80 px-2.5 py-1 rounded-lg">
                          {typeof cat === 'object' ? cat.name : cat}
                        </span>
                      ))}
                    </div>
                  )}
                  {recipe.category && !recipe.categories && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[11px] font-medium bg-primary/[0.07] text-primary/80 px-2.5 py-1 rounded-lg">
                        {typeof recipe.category === 'object' ? recipe.category.name : recipe.category}
                      </span>
                    </div>
                  )}

                  {/* Recipe Meta */}
                  <div className="flex items-center gap-3 text-xs text-textSecondary">
                    {recipe.prepTime && (
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{recipe.prepTime} min</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{recipe.servings} portions</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border/30 p-14 text-center max-w-lg mx-auto">
            {searchQuery ? (
              <>
                <div className="text-5xl mb-5">🔍</div>
                <h3 className="text-lg font-bold text-text mb-2">Aucune recette trouvée</h3>
                <p className="text-textSecondary text-sm mb-6">
                  Aucune recette ne correspond à "{searchQuery}". Essayez un autre terme.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-secondary transition-colors duration-200 font-semibold text-sm"
                >
                  Effacer la recherche
                </button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-5">📝</div>
                <h3 className="text-lg font-bold text-text mb-2">Pas encore de recettes</h3>
                <p className="text-textSecondary text-sm mb-6">
                  Commencez votre collection en ajoutant votre première recette !
                </p>
                <Link
                  href="/create-recipe"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-secondary transition-colors duration-200 font-semibold text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter une recette
                </Link>
              </>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !searchQuery && (
          <div className="mt-14">
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
            <div className="mt-4 text-center text-xs text-textLight">
              {((currentPage - 1) * pagination.limit) + 1}–{Math.min(currentPage * pagination.limit, pagination.total)} sur {pagination.total} recettes
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
