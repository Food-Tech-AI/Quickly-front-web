'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { clientApi } from '@/lib/client-api';
import { api } from '@/lib/client-api';
import { formatQuantity, calculateScaledQuantity, getDefaultServings, isScalableUnit } from '@/lib/recipe-utils';

type Language = 'en' | 'ar' | 'fr';

interface RecipeIngredient {
  id: number;
  quantity: string | number;
  unit: string;
  recipeId: number;
  ingredientId: number;
  ingredient: {
    id: number;
    name: string;
    name_ar?: string;
    name_fr?: string;
    description?: string;
    unit?: string;
    imageUrl?: string;
    isActive: boolean;
    nutritionalInfo?: any;
    createdAt?: string;
    updatedAt?: string;
    categoryId?: number;
  };
}

interface Recipe {
  id: number;
  title: string;
  title_ar?: string;
  title_fr?: string;
  description?: string;
  description_ar?: string;
  description_fr?: string;
  instructions?: string | string[];
  instructions_ar?: string[];
  instructions_fr?: string[];
  image?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  seasonality?: string;
  recipeIngredients?: RecipeIngredient[];
  ingredients?: RecipeIngredient[]; // Legacy support
  categories?: Array<{
    id: number;
    name: string;
  }>;
  category?: {
    id: number;
    name: string;
  };
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  nutrition_profile?: {
    fat_type?: string;
    carb_type?: string;
    salt_level?: string;
    fiber_level?: string;
    sugar_level?: string;
    calorie_band?: string;
    protein_level?: string;
  };
  createdAt?: string;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageGenerationError, setImageGenerationError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [selectedServings, setSelectedServings] = useState<number | null>(null);
  
  // Product matching state
  const [productMatches, setProductMatches] = useState<{
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
  } | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'products'>('ingredients');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  // Track which alternative product to show per ingredient (key: ingredient_id/name, value: index in ranked_products)
  const [productDisplayIndex, setProductDisplayIndex] = useState<Record<string, number>>({});

  const recipeId = params?.id as string;

  // Get the default servings from recipe or fallback to 2
  const defaultServings = useMemo(() => getDefaultServings(recipe?.servings), [recipe?.servings]);
  
  // Current servings (user selected or default)
  const currentServings = selectedServings ?? defaultServings;

  // Helper to get scaled quantity for display
  const getScaledQuantity = (quantity: string | number, unit: string) => {
    const scaled = calculateScaledQuantity(quantity, defaultServings, currentServings, unit);
    return formatQuantity(scaled, unit);
  };

  // Helper function to get text in selected language
  const getText = (en?: string, ar?: string, fr?: string) => {
    if (language === 'ar' && ar) return ar;
    if (language === 'fr' && fr) return fr;
    return en || '';
  };

  // Get ingredient name in selected language
  const getIngredientName = (ingredient: RecipeIngredient['ingredient']) => {
    if (language === 'ar' && ingredient.name_ar) return ingredient.name_ar;
    if (language === 'fr' && ingredient.name_fr) return ingredient.name_fr;
    return ingredient.name || `Ingredient #${ingredient.id}`;
  };

  // Get instructions in selected language
  const getInstructions = () => {
    if (!recipe) return null;
    if (language === 'ar' && recipe.instructions_ar) return recipe.instructions_ar;
    if (language === 'fr' && recipe.instructions_fr) return recipe.instructions_fr;
    if (Array.isArray(recipe.instructions)) return recipe.instructions;
    if (typeof recipe.instructions === 'string') return [recipe.instructions];
    return null;
  };

  // Get difficulty label
  const getDifficultyLabel = (difficulty?: string) => {
    if (!difficulty) return null;
    const labels: Record<string, { en: string; ar: string; fr: string }> = {
      easy: { en: 'Easy', ar: 'سهل', fr: 'Facile' },
      medium: { en: 'Medium', ar: 'متوسط', fr: 'Moyen' },
      hard: { en: 'Hard', ar: 'صعب', fr: 'Difficile' },
    };
    const label = labels[difficulty.toLowerCase()];
    if (!label) return difficulty;
    return getText(label.en, label.ar, label.fr);
  };

  // Get seasonality label
  const getSeasonalityLabel = (seasonality?: string) => {
    if (!seasonality) return null;
    const labels: Record<string, { en: string; ar: string; fr: string }> = {
      all_year: { en: 'All Year', ar: 'طوال السنة', fr: 'Toute l\'année' },
      spring: { en: 'Spring', ar: 'ربيع', fr: 'Printemps' },
      summer: { en: 'Summer', ar: 'صيف', fr: 'Été' },
      fall: { en: 'Fall', ar: 'خريف', fr: 'Automne' },
      winter: { en: 'Winter', ar: 'شتاء', fr: 'Hiver' },
    };
    const label = labels[seasonality.toLowerCase()];
    if (!label) return seasonality;
    return getText(label.en, label.ar, label.fr);
  };

  // Generate image for recipe
  const handleGenerateImage = async () => {
    if (!recipeId) return;

    setGeneratingImage(true);
    setImageGenerationError(null);
    setGenerationProgress(0);

    // Simulate progress for better UX (max 90%, remaining 10% when actual response comes)
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 5;
      });
    }, 3000); // Update every 3 seconds

    try {
      const updatedRecipe = await api.generateRecipeImage(Number(recipeId));
      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Update the recipe with new image
      if (updatedRecipe && updatedRecipe.image) {
        setRecipe((prev) => (prev ? { ...prev, image: updatedRecipe.image } : null));
        
        // Clear progress after showing completion
        setTimeout(() => {
          setGenerationProgress(0);
        }, 1000);
      } else {
        throw new Error('Image generation completed but no image URL was returned');
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setGenerationProgress(0);
      
      console.error('Error generating image:', err);
      
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        setImageGenerationError(
          language === 'ar' 
            ? 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.'
            : language === 'fr'
            ? 'La requête a expiré. Veuillez réessayer.'
            : 'Request timed out. The image generation may still be in progress. Please refresh the page in a moment.'
        );
      } else if (err?.response?.status === 401) {
        router.push('/login?returnTo=/recipe/' + recipeId);
      } else {
        setImageGenerationError(
          err?.response?.data?.message || 
          err?.message || 
          (language === 'ar' 
            ? 'فشل في إنشاء الصورة. يرجى المحاولة مرة أخرى.'
            : language === 'fr'
            ? 'Échec de la génération d\'image. Veuillez réessayer.'
            : 'Failed to generate image. Please try again.')
        );
      }
    } finally {
      setGeneratingImage(false);
    }
  };

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

  // Fetch product matches for recipe ingredients
  useEffect(() => {
    async function fetchProductMatches() {
      if (!recipe) return;
      
      const ingredients = recipe.recipeIngredients || recipe.ingredients || [];
      if (ingredients.length === 0) return;

      setLoadingProducts(true);
      setProductError(null);

      try {
        // Prepare ingredients with French names for matching
        const ingredientsToMatch = ingredients.map((ing) => ({
          name_fr: ing.ingredient.name_fr || ing.ingredient.name,
          quantity: typeof ing.quantity === 'number' ? ing.quantity : parseFloat(String(ing.quantity)) || 1,
          unit: ing.unit || '',
          ingredient_id: ing.ingredientId,
        }));

        const result = await api.matchIngredientsToProducts(ingredientsToMatch, {
          top_k: 3,
          use_gpt_ranking: true,
        });

        setProductMatches(result);
      } catch (err: any) {
        console.error('Error fetching product matches:', err);
        setProductError(
          language === 'ar'
            ? 'فشل في تحميل المنتجات المطابقة'
            : language === 'fr'
            ? 'Échec du chargement des produits correspondants'
            : 'Failed to load matching products'
        );
      } finally {
        setLoadingProducts(false);
      }
    }

    fetchProductMatches();
  }, [recipe, language]);

  if (loading) {
    return (
      <main className="min-h-screen py-20 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !recipe) {
    return (
      <main className="min-h-screen py-20 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-error font-medium mb-4">{error || 'Recipe not found'}</p>
            <Link
              href="/recipe"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
            >
              ← Back to Recipes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const recipeTitle = getText(recipe.title, recipe.title_ar, recipe.title_fr);
  const recipeDescription = getText(recipe.description, recipe.description_ar, recipe.description_fr);
  const instructions = getInstructions();

  return (
    <main className="min-h-screen py-20 bg-background">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header with Back Button and Language Selector */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/recipe"
            className="inline-flex items-center gap-2 text-textSecondary hover:text-primary transition-colors group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Recipes</span>
          </Link>

          {/* Language Selector */}
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl p-1">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                language === 'en'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-textSecondary hover:text-text hover:bg-surfaceSecondary'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                language === 'ar'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-textSecondary hover:text-text hover:bg-surfaceSecondary'
              }`}
              dir="rtl"
            >
              AR
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                language === 'fr'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-textSecondary hover:text-text hover:bg-surfaceSecondary'
              }`}
            >
              FR
            </button>
          </div>
        </div>

        {/* Recipe Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5 group">
            {recipe.image ? (
              <>
                <img
                  src={recipe.image}
                  alt={recipeTitle}
                  className="w-full h-full object-cover aspect-video transition-transform group-hover:scale-105"
                />
                {/* Generate Image Button Overlay */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleGenerateImage}
                    disabled={generatingImage}
                    className="px-4 py-2 bg-white/90 backdrop-blur-sm text-primary rounded-lg font-medium hover:bg-white transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {generatingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                        <span className="text-sm">
                          {language === 'ar' ? 'جاري الإنشاء...' : language === 'fr' ? 'Génération...' : 'Generating...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">
                          {language === 'ar' ? 'إنشاء صورة جديدة' : language === 'fr' ? 'Générer une image' : 'Generate Image'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="relative w-full aspect-video bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 flex flex-col items-center justify-center">
                <span className="text-9xl opacity-50 mb-4">🍳</span>
                <button
                  onClick={handleGenerateImage}
                  disabled={generatingImage}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generatingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>
                        {language === 'ar' ? 'جاري إنشاء الصورة...' : language === 'fr' ? 'Génération de l\'image...' : 'Generating image...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {language === 'ar' ? 'إنشاء صورة للوصفة' : language === 'fr' ? 'Générer une image' : 'Generate Recipe Image'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* Progress Bar */}
            {generatingImage && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4">
                <div className="mb-2 flex items-center justify-between text-white text-sm">
                  <span>
                    {language === 'ar' 
                      ? 'جاري إنشاء الصورة باستخدام الذكاء الاصطناعي...' 
                      : language === 'fr'
                      ? 'Génération de l\'image avec IA...'
                      : 'Generating image with AI...'}
                  </span>
                  <span className="font-semibold">{generationProgress}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <p className="text-white/80 text-xs mt-2">
                  {language === 'ar' 
                    ? 'قد تستغرق هذه العملية دقيقة أو دقيقتين...' 
                    : language === 'fr'
                    ? 'Cela peut prendre une minute ou deux...'
                    : 'This may take a minute or two...'}
                </p>
              </div>
            )}

            {/* Error Message */}
            {imageGenerationError && (
              <div className="absolute bottom-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium">{imageGenerationError}</p>
                    <button
                      onClick={() => setImageGenerationError(null)}
                      className="mt-2 text-xs underline hover:no-underline"
                    >
                      {language === 'ar' ? 'إغلاق' : language === 'fr' ? 'Fermer' : 'Dismiss'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recipe Info */}
          <div className="space-y-6">
            <div>
              <h1 
                className={`text-4xl md:text-5xl font-bold text-text mb-4 leading-tight ${language === 'ar' ? 'text-right' : ''}`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                {recipeTitle}
              </h1>
              {recipeDescription && (
                <p 
                  className={`text-textSecondary text-lg leading-relaxed ${language === 'ar' ? 'text-right' : ''}`}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  {recipeDescription}
                </p>
              )}
            </div>

            {/* Meta Information Cards */}
            <div className="grid grid-cols-2 gap-4">
              {recipe.prepTime && (
                <div className="bg-surface rounded-xl p-5 border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-textLight mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">{language === 'ar' ? 'وقت التحضير' : language === 'fr' ? 'Préparation' : 'Prep Time'}</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{recipe.prepTime} {language === 'ar' ? 'د' : language === 'fr' ? 'min' : 'min'}</p>
                </div>
              )}
              {recipe.cookTime && (
                <div className="bg-surface rounded-xl p-5 border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-textLight mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                    <span className="text-sm font-medium">{language === 'ar' ? 'وقت الطهي' : language === 'fr' ? 'Cuisson' : 'Cook Time'}</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{recipe.cookTime} {language === 'ar' ? 'د' : language === 'fr' ? 'min' : 'min'}</p>
                </div>
              )}
              <div className="bg-surface rounded-xl p-5 border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-textLight mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-medium">{language === 'ar' ? 'الوجبات' : language === 'fr' ? 'Portions' : 'Servings'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedServings(Math.max(1, currentServings - 1))}
                      disabled={currentServings <= 1}
                      className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={language === 'ar' ? 'تقليل الوجبات' : language === 'fr' ? 'Diminuer les portions' : 'Decrease servings'}
                    >
                      −
                    </button>
                    <span className="text-2xl font-bold text-text min-w-[2rem] text-center">{currentServings}</span>
                    <button
                      onClick={() => setSelectedServings(Math.min(20, currentServings + 1))}
                      disabled={currentServings >= 20}
                      className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={language === 'ar' ? 'زيادة الوجبات' : language === 'fr' ? 'Augmenter les portions' : 'Increase servings'}
                    >
                      +
                    </button>
                  </div>
                  {recipe.servings && currentServings !== defaultServings && (
                    <button
                      onClick={() => setSelectedServings(null)}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      {language === 'ar' ? `إعادة إلى ${defaultServings}` : language === 'fr' ? `Réinitialiser à ${defaultServings}` : `Reset to ${defaultServings}`}
                    </button>
                  )}
                </div>
              {totalTime > 0 && (
                <div className="bg-surface rounded-xl p-5 border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-textLight mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm font-medium">{language === 'ar' ? 'الوقت الإجمالي' : language === 'fr' ? 'Temps total' : 'Total Time'}</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{totalTime} {language === 'ar' ? 'د' : language === 'fr' ? 'min' : 'min'}</p>
                </div>
              )}
            </div>

            {/* Difficulty and Seasonality */}
            {(recipe.difficulty || recipe.seasonality) && (
              <div className="flex flex-wrap gap-3">
                {recipe.difficulty && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                    <span>⚡</span>
                    {getDifficultyLabel(recipe.difficulty)}
                  </div>
                )}
                {recipe.seasonality && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                    <span>🌱</span>
                    {getSeasonalityLabel(recipe.seasonality)}
                  </div>
                )}
              </div>
            )}

            {/* Categories */}
            {(recipe.categories && recipe.categories.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {recipe.categories.map((cat) => (
                  <div key={cat.id} className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors">
                    <span>📁</span>
                    {cat.name}
                  </div>
                ))}
              </div>
            )}
            {recipe.category && !recipe.categories && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors">
                <span>📁</span>
                {recipe.category.name}
              </div>
            )}
          </div>
        </div>

        {/* Ingredients & Instructions */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients & Products */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 sticky top-24 hover:shadow-md transition-shadow">
              {/* Tab Buttons */}
              <div className="flex items-center gap-1 mb-6 bg-surfaceSecondary rounded-xl p-1 border border-border">
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'ingredients'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-textSecondary hover:text-text hover:bg-surface'
                  }`}
                >
                  <span>🥘</span>
                  <span>{language === 'ar' ? 'المكونات' : language === 'fr' ? 'Ingrédients' : 'Ingredients'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'products'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-textSecondary hover:text-text hover:bg-surface'
                  }`}
                >
                  <span>🛒</span>
                  <span>{language === 'ar' ? 'المنتجات' : language === 'fr' ? 'Produits' : 'Products'}</span>
                  {productMatches && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === 'products' ? 'bg-white/20' : 'bg-primary/10 text-primary'
                    }`}>
                      {productMatches.matches.filter(m => m.ranked_products.length > 0).length}
                    </span>
                  )}
                </button>
              </div>

              {/* ===== INGREDIENTS TAB ===== */}
              {activeTab === 'ingredients' && (
                <div>
                  {(() => {
                    const ingredients = recipe.recipeIngredients || recipe.ingredients || [];

                    return ingredients.length > 0 ? (
                      <ul className={`space-y-3 ${language === 'ar' ? 'text-right' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {ingredients.map((ing) => (
                          <li key={ing.id} className="group flex items-start gap-3 text-textSecondary hover:bg-primary/5 rounded-lg p-2 -m-2 transition-colors">
                            <span className="text-primary mt-1.5 font-bold group-hover:scale-110 transition-transform">•</span>
                            <span className="flex-1">
                              <span className="font-semibold text-text">
                                {getScaledQuantity(ing.quantity, ing.unit)} {ing.unit}
                              </span>{' '}
                              <span className="text-textSecondary">{getIngredientName(ing.ingredient)}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`text-textSecondary ${language === 'ar' ? 'text-right' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? 'لا توجد مكونات مدرجة' : language === 'fr' ? 'Aucun ingrédient listé' : 'No ingredients listed'}
                      </p>
                    );
                  })()}
                </div>
              )}

              {/* ===== PRODUCTS TAB ===== */}
              {activeTab === 'products' && (
                <div>
                  {/* Product Loading State */}
                  {loadingProducts && (
                    <div className="p-4 bg-primary/5 rounded-lg flex items-center gap-3">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span className="text-sm text-textSecondary">
                        {language === 'ar'
                          ? 'جاري تحميل المنتجات المطابقة...'
                          : language === 'fr'
                          ? 'Chargement des produits correspondants...'
                          : 'Loading matching products...'}
                      </span>
                    </div>
                  )}

                  {/* Product Error State */}
                  {productError && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                      {productError}
                    </div>
                  )}

                  {/* Product List - one product per ingredient with swap */}
                  {productMatches && !loadingProducts && (() => {
                    const ingredients = recipe.recipeIngredients || recipe.ingredients || [];
                    const matchesWithProducts = productMatches.matches.filter(m => m.ranked_products.length > 0);

                    return matchesWithProducts.length > 0 ? (
                      <div className="space-y-3">
                        {matchesWithProducts.map((match) => {
                          const ing = ingredients.find(i => i.ingredientId === match.ingredient_id);
                          const matchKey = String(match.ingredient_id || match.ingredient_name);
                          const currentIdx = productDisplayIndex[matchKey] || 0;
                          const product = match.ranked_products[currentIdx];
                          const hasAlternatives = match.ranked_products.length > 1;
                          const isSelected = product ? selectedProducts.has(product.id) : false;

                          if (!product) return null;

                          return (
                            <div
                              key={matchKey}
                              className={`rounded-xl border transition-all ${
                                isSelected
                                  ? 'bg-primary/5 border-primary/30 shadow-sm'
                                  : 'bg-white border-gray-200 hover:border-primary/20'
                              }`}
                            >
                              {/* Ingredient name header */}
                              <div className="px-3.5 pt-3 pb-1.5 flex items-center justify-between">
                                <span className="text-xs font-semibold text-textSecondary uppercase tracking-wide truncate">
                                  {ing ? getIngredientName(ing.ingredient) : match.ingredient_name}
                                </span>
                                {hasAlternatives && (
                                  <span className="text-[10px] text-textSecondary">
                                    {currentIdx + 1}/{match.ranked_products.length}
                                  </span>
                                )}
                              </div>

                              {/* Product row */}
                              <div className="flex items-center gap-3 px-3.5 pb-3">
                                {/* Product Image */}
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.label}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder-product.png';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                                  )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-text truncate" title={product.label}>
                                    {product.label}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {product.price != null && (
                                      <span className="text-sm font-bold text-primary">
                                        {product.price.toFixed(2)} {product.currency || 'MAD'}
                                      </span>
                                    )}
                                    {product.product_weight && product.product_unit && (
                                      <span className="text-[11px] text-textSecondary">
                                        {product.product_weight}{product.product_unit}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Swap / Replace button */}
                                {hasAlternatives && (
                                  <button
                                    onClick={() => {
                                      setProductDisplayIndex(prev => {
                                        const next = (currentIdx + 1) % match.ranked_products.length;
                                        return { ...prev, [matchKey]: next };
                                      });
                                    }}
                                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                                    title={language === 'fr' ? 'Remplacer' : language === 'ar' ? 'استبدال' : 'Replace'}
                                  >
                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                    </svg>
                                  </button>
                                )}

                                {/* Select toggle */}
                                <button
                                  onClick={() => {
                                    setSelectedProducts(prev => {
                                      const next = new Set(prev);
                                      if (next.has(product.id)) {
                                        next.delete(product.id);
                                      } else {
                                        next.add(product.id);
                                      }
                                      return next;
                                    });
                                  }}
                                  className={`flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-primary border-primary'
                                      : 'border-gray-300 hover:border-primary/50'
                                  }`}
                                  aria-label={isSelected ? 'Deselect' : 'Select'}
                                >
                                  {isSelected && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* Selected count summary */}
                        {selectedProducts.size > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-sm font-medium text-primary flex items-center gap-2">
                              <span>✅</span>
                              <span>
                                {language === 'ar'
                                  ? `${selectedProducts.size} منتجات محددة`
                                  : language === 'fr'
                                  ? `${selectedProducts.size} produit(s) sélectionné(s)`
                                  : `${selectedProducts.size} product(s) selected`}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <span className="text-4xl mb-3 block">📦</span>
                        <p className="text-textSecondary text-sm">
                          {language === 'ar'
                            ? 'لم يتم العثور على منتجات مطابقة'
                            : language === 'fr'
                            ? 'Aucun produit correspondant trouvé'
                            : 'No matching products found'}
                        </p>
                      </div>
                    );
                  })()}

                  {!productMatches && !loadingProducts && !productError && (
                    <div className="text-center py-8">
                      <span className="text-4xl mb-3 block">🔍</span>
                      <p className="text-textSecondary text-sm">
                        {language === 'ar'
                          ? 'جاري البحث عن منتجات...'
                          : language === 'fr'
                          ? 'Recherche de produits...'
                          : 'Searching for products...'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
              <h2 
                className={`text-2xl font-bold text-text mb-6 flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                <span className="text-2xl">📝</span>
                <span>{language === 'ar' ? 'طريقة التحضير' : language === 'fr' ? 'Instructions' : 'Instructions'}</span>
              </h2>
              {instructions ? (
                <div className="prose max-w-none">
                  {Array.isArray(instructions) ? (
                    <ol className={`space-y-5 ${language === 'ar' ? 'text-right' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {instructions.map((step, index) => (
                        <li key={index} className="flex gap-4 text-textSecondary group">
                          <span className={`flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all ${language === 'ar' ? 'order-2' : ''}`}>
                            {index + 1}
                          </span>
                          <span className={`flex-1 leading-relaxed text-base ${language === 'ar' ? 'text-right' : ''}`}>{step}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className={`text-textSecondary whitespace-pre-wrap leading-relaxed ${language === 'ar' ? 'text-right' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {instructions}
                    </div>
                  )}
                </div>
              ) : (
                <p className={`text-textSecondary ${language === 'ar' ? 'text-right' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar' ? 'لا توجد تعليمات متوفرة' : language === 'fr' ? 'Aucune instruction fournie' : 'No instructions provided'}
                </p>
              )}
            </div>

            {/* Nutrition (if available) */}
            {recipe.nutrition && (
              <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
                <h2 
                  className={`text-2xl font-bold text-text mb-6 flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  <span className="text-2xl">💪</span>
                  <span>{language === 'ar' ? 'المعلومات الغذائية' : language === 'fr' ? 'Valeurs nutritionnelles' : 'Nutrition Information'}</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recipe.nutrition.calories && (
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                      <p className="text-sm text-textLight font-medium mb-1">
                        {language === 'ar' ? 'سعرات حرارية' : language === 'fr' ? 'Calories' : 'Calories'}
                      </p>
                      <p className="text-2xl font-bold text-text">{recipe.nutrition.calories}</p>
                    </div>
                  )}
                  {recipe.nutrition.protein && (
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <p className="text-sm text-textLight font-medium mb-1">
                        {language === 'ar' ? 'بروتين' : language === 'fr' ? 'Protéines' : 'Protein'}
                      </p>
                      <p className="text-2xl font-bold text-text">{recipe.nutrition.protein}g</p>
                    </div>
                  )}
                  {recipe.nutrition.carbs && (
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                      <p className="text-sm text-textLight font-medium mb-1">
                        {language === 'ar' ? 'كربوهيدرات' : language === 'fr' ? 'Glucides' : 'Carbs'}
                      </p>
                      <p className="text-2xl font-bold text-text">{recipe.nutrition.carbs}g</p>
                    </div>
                  )}
                  {recipe.nutrition.fat && (
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <p className="text-sm text-textLight font-medium mb-1">
                        {language === 'ar' ? 'دهون' : language === 'fr' ? 'Graisses' : 'Fat'}
                      </p>
                      <p className="text-2xl font-bold text-text">{recipe.nutrition.fat}g</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
