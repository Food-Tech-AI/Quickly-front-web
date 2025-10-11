'use client';

import { featuredRecipes } from '../data/fakeData';
import Image from 'next/image';
import { toast } from 'sonner';

export default function RecipeShowcase() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-text mb-4">
            Trending <span className="text-primary">Recipes</span>
          </h2>
          <p className="text-xl text-textSecondary max-w-2xl mx-auto">
            Discover what the community is cooking right now.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {featuredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-surface rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
            >
              {/* Recipe Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="text-heart">❤️</span>
                  <span className="font-semibold text-text text-sm">{recipe.likes}</span>
                </div>
                <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="font-semibold text-white text-sm">{recipe.difficulty}</span>
                </div>
              </div>

              {/* Recipe Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-text mb-2 group-hover:text-primary transition-colors">
                  {recipe.title}
                </h3>
                <p className="text-textSecondary mb-4">{recipe.author}</p>

                <div className="flex items-center justify-between text-sm text-textSecondary">
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>{recipe.cookTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🥗</span>
                    <span>{recipe.ingredients} ingredients</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button 
            onClick={() => toast.info('📚 Browse 50,000+ Recipes', {
              description: 'Download Quickly to explore all recipes',
              duration: 3000,
            })}
            className="px-8 py-4 gradient-button text-white font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg"
          >
            Explore All Recipes
          </button>
        </div>
      </div>
    </section>
  );
}

