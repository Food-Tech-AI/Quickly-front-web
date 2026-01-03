"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/client-api';

interface Ingredient {
  id: number;
  name: string;
  unit?: string;
  category?: {
    id: number;
    name: string;
  };
  imageUrl?: string;
}

interface IngredientCategory {
  id: number;
  name: string;
}

interface IngredientPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ingredient: Ingredient) => void;
}

export default function IngredientPickerModal({
  isOpen,
  onClose,
  onSelect,
}: IngredientPickerModalProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  // Create mode state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  
  // Create form fields
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number | ''>('');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchIngredients();
      fetchCategories();
    }
  }, [isOpen, searchQuery, page]);

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await api.getIngredients({
        page,
        limit,
        search: searchQuery,
        sortBy: 'name',
        sortOrder: 'ASC',
      });

      setIngredients(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalCount(response.meta?.totalItems || 0);
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on new search
    setShowCreateForm(false); // Hide create form when searching
  };

  const handleSelect = (ingredient: Ingredient) => {
    onSelect(ingredient);
    resetAndClose();
  };

  const handleCreateIngredient = async () => {
    if (!newName.trim()) {
      setCreateError('Ingredient name is required');
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const newIngredient = await api.createIngredient({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        unit: newUnit.trim() || undefined,
        categoryId: newCategoryId ? Number(newCategoryId) : undefined,
      });

      // Immediately select the newly created ingredient
      onSelect(newIngredient);
      resetAndClose();
    } catch (error: any) {
      console.error('Failed to create ingredient:', error);
      setCreateError(error.response?.data?.error || error.message || 'Failed to create ingredient');
    } finally {
      setCreating(false);
    }
  };

  const resetAndClose = () => {
    setSearchQuery('');
    setPage(1);
    setShowCreateForm(false);
    setNewName('');
    setNewDescription('');
    setNewUnit('');
    setNewCategoryId('');
    setCreateError(null);
    onClose();
  };

  const toggleCreateForm = () => {
    setShowCreateForm(!showCreateForm);
    setCreateError(null);
    if (!showCreateForm && searchQuery) {
      setNewName(searchQuery); // Pre-fill with search query
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={resetAndClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Select Ingredient
            </h2>
            <button
              onClick={resetAndClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Count */}
          <p className="text-sm text-gray-600 mt-2">
            {loading ? 'Loading...' : `${totalCount} ingredients found`}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showCreateForm ? (
            /* Create New Ingredient Form */
            <div className="max-w-lg mx-auto">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create New Ingredient</h3>
                <p className="text-sm text-gray-600">Add a new ingredient to the database</p>
              </div>

              {createError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {createError}
                </div>
              )}

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Olive Oil"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Brief description of the ingredient"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Unit (optional)
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g., cups, grams, tablespoons"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category (optional)
                  </label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCreateIngredient}
                    disabled={creating || !newName.trim()}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {creating ? 'Creating...' : 'Create Ingredient'}
                  </button>
                  <button
                    type="button"
                    onClick={toggleCreateForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : ingredients.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">No ingredients found</p>
              <p className="text-gray-400 text-sm mb-6">
                {searchQuery 
                  ? `No results for "${searchQuery}". Create it instead?`
                  : 'Try searching or create a new ingredient'}
              </p>
              <button
                onClick={toggleCreateForm}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Ingredient
              </button>
            </div>
          ) : (
            <>
              {/* Create button above results */}
              <div className="mb-4">
                <button
                  onClick={toggleCreateForm}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-primary font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Can't find it? Create new ingredient
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {ingredients.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    onClick={() => handleSelect(ingredient)}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    {/* Ingredient Image */}
                    {ingredient.imageUrl ? (
                      <img
                        src={ingredient.imageUrl}
                        alt={ingredient.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-2xl">🥗</span>
                      </div>
                    )}

                    {/* Ingredient Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary">
                        {ingredient.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {ingredient.category && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {ingredient.category.name}
                          </span>
                        )}
                        {ingredient.unit && (
                          <span className="text-xs text-gray-500">
                            Unit: {ingredient.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Select Icon */}
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer - Pagination */}
        {!showCreateForm && totalPages > 1 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
