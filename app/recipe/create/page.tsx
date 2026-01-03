"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import IngredientPickerModal from "@/components/IngredientPickerModal";

interface Category {
  id: number;
  name: string;
}

interface Ingredient {
  ingredientId: number;
  quantity: number;
  unit: string;
}

interface SelectedIngredient extends Ingredient {
  name: string;
}

export default function CreateRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // Form data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [prepTime, setPrepTime] = useState<number | "">("");
  const [cookTime, setCookTime] = useState<number | "">("");
  const [servings, setServings] = useState<number | "">("");
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [ingredients, setIngredients] = useState<SelectedIngredient[]>([]);
  const [generateImage, setGenerateImage] = useState(true);

  // Modal state
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);

  // Available categories (fetch from API)
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch categories directly from external API
    async function loadCategories() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/categories`, {
          credentials: 'include',
        });
        if (res.status === 401) {
          router.push('/login?returnTo=/recipe/create');
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to load categories');
        }
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setError("Failed to load categories. Please refresh the page.");
      }
    }
    loadCategories();
  }, [router]);

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSelectIngredient = (ingredient: any) => {
    const newIngredient: SelectedIngredient = {
      ingredientId: ingredient.id,
      name: ingredient.name,
      quantity: 0,
      unit: ingredient.unit || "",
    };
    setIngredients([...ingredients, newIngredient]);
  };

  const updateIngredient = (
    index: number,
    field: keyof SelectedIngredient,
    value: string | number
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLoadingMessage("Preparing recipe...");

    try {
      // Validate
      if (!title || !categoryId) {
        throw new Error("Title and category are required");
      }

      const validInstructions = instructions.filter((i) => i.trim() !== "");
      if (validInstructions.length === 0) {
        throw new Error("At least one instruction is required");
      }

      const validIngredients = ingredients.filter(
        (i) => i.ingredientId > 0 && i.quantity > 0 && i.unit.trim() !== ""
      );
      if (validIngredients.length === 0) {
        throw new Error("At least one valid ingredient is required");
      }

      // Map to backend format (remove name field)
      const ingredientsForBackend = validIngredients.map(({ name, ...rest }) => rest);

      const payload = {
        title,
        description,
        categoryId: Number(categoryId),
        prepTime: prepTime ? Number(prepTime) : undefined,
        cookTime: cookTime ? Number(cookTime) : undefined,
        servings: servings ? Number(servings) : undefined,
        instructions: validInstructions,
        ingredients: ingredientsForBackend,
        generateImage,
      };

      console.log("Creating recipe:", payload);

      if (generateImage) {
        setLoadingMessage("🎨 Generating AI image with DALL-E 3...");
        // Add a slight delay to show the message
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Direct API call to external backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (generateImage) {
        setLoadingMessage("☁️ Uploading image to S3...");
      }

      const result = await response.json();
      
      if (!response.ok) {
        // Handle authentication error
        if (response.status === 401) {
          router.push('/login?returnTo=/recipe/create');
          return;
        }
        throw new Error(result.error || result.message || "Failed to create recipe");
      }

      console.log("Recipe created successfully:", result);

      setLoadingMessage("✅ Recipe created successfully!");
      setSuccess(true);
      setTimeout(() => {
        router.push(`/recipe/${result.id}`);
      }, 1500);
    } catch (err: any) {
      console.error("Error creating recipe:", err);
      setError(err.message || "Failed to create recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface rounded-2xl shadow-xl p-8 border border-border">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text mb-2">Create New Recipe</h1>
            <p className="text-textSecondary">Share your culinary creation with the world</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-start gap-3">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-medium">Success!</p>
                <p className="text-sm mt-1">Recipe created successfully! Redirecting...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Recipe Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                placeholder="e.g., Delicious Pasta Carbonara"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                rows={3}
                placeholder="Brief description of your recipe..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Timing & Servings */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Prep Time (min)
                </label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                  min="0"
                  placeholder="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Cook Time (min)
                </label>
                <input
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                  min="0"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                  min="1"
                  placeholder="4"
                />
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Ingredients *
              </label>
              
              {ingredients.length === 0 ? (
                <div className="mb-4 p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-center">
                  <p className="text-gray-600 mb-2">No ingredients added yet</p>
                  <p className="text-sm text-gray-500">Click "Add Ingredient" below to search and select from the database</p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {ingredients.map((ing, index) => (
                    <div key={index} className="flex gap-2 items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{ing.name}</p>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={ing.quantity || ""}
                            onChange={(e) =>
                              updateIngredient(index, "quantity", Number(e.target.value))
                            }
                            className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            step="0.01"
                            min="0"
                          />
                          <input
                            type="text"
                            placeholder="Unit (e.g., cups)"
                            value={ing.unit}
                            onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                type="button"
                onClick={() => setShowIngredientPicker(true)}
                className="mt-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Ingredient
              </button>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Instructions *
              </label>
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <span className="pt-3 font-semibold text-primary text-lg min-w-[24px]">{index + 1}.</span>
                  <textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text"
                    rows={2}
                    placeholder={`Step ${index + 1}: Describe this cooking step...`}
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addInstruction}
                className="mt-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary transition-colors font-medium"
              >
                + Add Step
              </button>
            </div>

            {/* Generate AI Image */}
            <div className="bg-accent/20 border border-accent/30 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateImage}
                  onChange={(e) => setGenerateImage(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-semibold text-text block">
                    ✨ Generate AI Image
                  </span>
                  <span className="text-xs text-textSecondary">
                    Uses DALL-E 3 to create a beautiful food photo for your recipe
                  </span>
                </div>
              </label>
              {generateImage && (
                <div className="mt-3 pt-3 border-t border-accent/30">
                  <div className="flex items-start gap-2 text-xs text-textSecondary">
                    <span>ℹ️</span>
                    <div>
                      <p className="font-medium text-text mb-1">How it works:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>AI generates a photorealistic image based on your recipe</li>
                        <li>Image is automatically uploaded to cloud storage (S3)</li>
                        <li>Takes 10-30 seconds for high-quality results</li>
                        <li>Uncheck this box to skip image generation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 gradient-button text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{loadingMessage || "Creating Recipe..."}</span>
                    </div>
                    {generateImage && loadingMessage.includes("Generating") && (
                      <span className="text-xs opacity-80">This may take 10-30 seconds...</span>
                    )}
                  </span>
                ) : (
                  "✨ Create Recipe"
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-surface border-2 border-border text-text font-semibold rounded-xl hover:bg-surfaceSecondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Ingredient Picker Modal */}
      <IngredientPickerModal
        isOpen={showIngredientPicker}
        onClose={() => setShowIngredientPicker(false)}
        onSelect={handleSelectIngredient}
      />
    </div>
  );
}
