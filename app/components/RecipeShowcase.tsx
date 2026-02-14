'use client';

import { featuredRecipes } from '../data/fakeData';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RecipeShowcase() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFF9F0 0%, #FFFCF7 100%)' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-primary/[0.08] text-primary font-semibold rounded-full text-sm tracking-wide border border-primary/[0.12]">
            🍽️ RECETTES POPULAIRES
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-text mt-6 mb-5 leading-[1.15] tracking-[-0.02em]">
            Recettes{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Tendances</span>
          </h2>
          <p className="text-lg text-textSecondary max-w-lg mx-auto leading-relaxed">
            Découvrez ce que la communauté cuisine en ce moment.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {featuredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
            >
              <Link
                href={`/recipe/${recipe.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-border/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:border-primary/20 transition-colors duration-300 block"
              >
              {/* Recipe Image */}
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  priority={recipe.id <= 3}
                  unoptimized={true}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                  <span className="text-heart text-sm">♥</span>
                  <span className="font-bold text-text text-xs">{recipe.likes.toLocaleString()}</span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm font-semibold text-text text-xs">
                    {recipe.difficulty}
                  </span>
                </div>
              </div>

              {/* Recipe Info */}
              <div className="p-5">
                <h3 className="text-[17px] font-bold text-text mb-1 group-hover:text-primary transition-colors duration-200">
                  {recipe.title}
                </h3>
                <p className="text-textLight text-sm mb-4">{recipe.author}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-textSecondary bg-gray-50 px-3 py-2 rounded-lg">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{recipe.cookTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-textSecondary bg-gray-50 px-3 py-2 rounded-lg">
                    <span>🥗</span>
                    <span>{recipe.ingredients} ingrédients</span>
                  </div>
                </div>
              </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="text-center mt-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a
            href="/recipe"
            className="group inline-flex items-center gap-2.5 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 text-base"
          >
            Explorer toutes les recettes
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

