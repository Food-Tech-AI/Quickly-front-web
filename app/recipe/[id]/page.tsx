'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { clientApi } from '@/lib/client-api';

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

  const recipeId = params?.id as string;

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
          <div className="rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
            {recipe.image ? (
              <img
                src={recipe.image}
                alt={recipeTitle}
                className="w-full h-full object-cover aspect-video"
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 flex items-center justify-center">
                <span className="text-9xl opacity-50">🍳</span>
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
              {recipe.servings && (
                <div className="bg-surface rounded-xl p-5 border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-textLight mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm font-medium">{language === 'ar' ? 'الوجبات' : language === 'fr' ? 'Portions' : 'Servings'}</span>
                  </div>
                  <p className="text-2xl font-bold text-text">{recipe.servings}</p>
                </div>
              )}
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
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 sticky top-24 hover:shadow-md transition-shadow">
              <h2 
                className={`text-2xl font-bold text-text mb-6 flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                <span className="text-2xl">🥘</span>
                <span>{language === 'ar' ? 'المكونات' : language === 'fr' ? 'Ingrédients' : 'Ingredients'}</span>
              </h2>
              {(() => {
                const ingredients = recipe.recipeIngredients || recipe.ingredients || [];
                return ingredients.length > 0 ? (
                  <ul className={`space-y-4 ${language === 'ar' ? 'text-right' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {ingredients.map((ing) => (
                      <li key={ing.id} className="flex items-start gap-3 text-textSecondary group">
                        <span className="text-primary mt-1.5 font-bold group-hover:scale-110 transition-transform">•</span>
                        <span className="flex-1">
                          <span className="font-semibold text-text">
                            {ing.quantity} {ing.unit}
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
