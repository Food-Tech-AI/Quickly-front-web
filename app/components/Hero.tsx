'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import { motion } from 'framer-motion';

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      track('Hero Search', { query: searchQuery });
      router.push(`/recipe?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFFCF7 0%, #FFF7EC 40%, #FFFCF7 100%)' }}>
      {/* Ambient background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(46,207,189,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,207,86,0.1) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="container mx-auto px-6 pt-28 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text Content */}
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/[0.08] text-primary font-semibold rounded-full text-sm tracking-wide border border-primary/[0.12]">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                RECETTES & COURSES INTELLIGENTES
              </span>
            </motion.div>

            <motion.h1 
              className="text-[2.75rem] md:text-[3.5rem] lg:text-[4.25rem] font-black text-text leading-[1.1] mt-8 mb-7 tracking-[-0.02em]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            >
              Bon{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Goût</span>
              .&nbsp;😋
              <br />
              Bon{' '}
              <span className="bg-gradient-to-r from-accent to-[#FF9F43] bg-clip-text text-transparent">Sens</span>
              .&nbsp;✨
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl text-textSecondary mb-10 leading-relaxed max-w-md"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            >
              Découvrez des centaines de recettes délicieuses, ajoutez vos ingrédients au panier et faites vos courses en un clic.
            </motion.p>

            {/* Search Bar */}
            <motion.form 
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
            >
              <div className={`flex items-center bg-white rounded-2xl border-2 overflow-hidden pr-2 transition-all duration-300 ${
                isFocused 
                  ? 'shadow-xl shadow-primary/10 border-primary/30' 
                  : 'shadow-lg shadow-black/5 border-transparent'
              }`}>
                <div className="pl-5 text-textLight">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Chercher une recette..."
                  aria-label="Rechercher une recette"
                  className="flex-1 px-4 py-5 bg-transparent outline-none text-text placeholder:text-textLight text-base"
                />
                <button
                  type="submit"
                  className="px-7 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 text-sm whitespace-nowrap"
                >
                  Chercher
                </button>
              </div>
            </motion.form>

            {/* Quick tags */}
            <motion.div
              className="flex flex-wrap gap-2 mt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {['🍝 Pasta', '🥗 Salade', '🍰 Dessert', '🍜 Soupe'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    const q = tag.split(' ').slice(1).join(' ');
                    router.push(`/recipe?q=${encodeURIComponent(q)}`);
                  }}
                  className="px-4 py-2 bg-white/80 text-textSecondary text-sm rounded-full border border-border/60 hover:border-primary/30 hover:text-primary hover:bg-primary/[0.05] transition-all duration-200"
                >
                  {tag}
                </button>
              ))}
            </motion.div>

            {/* Stats row */}
            <motion.div 
              className="flex items-center gap-8 mt-14"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
            >
              {[
                { value: '2000+', label: 'Recettes' },
                { value: '400+', label: 'Utilisateurs' },
                { value: '4.9★', label: 'Note' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div>
                    <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-text to-textSecondary bg-clip-text">{stat.value}</p>
                    <p className="text-xs text-textLight uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                  {i < 2 && <div className="w-px h-10 bg-border"></div>}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Hero Visual */}
          <div className="relative flex items-center justify-center">
            {/* Animated background glow */}
            <motion.div 
              className="absolute w-[280px] h-[280px] lg:w-[480px] lg:h-[480px] rounded-full"
              style={{ background: 'linear-gradient(135deg, rgba(46,207,189,0.15) 0%, rgba(255,207,86,0.12) 50%, rgba(75,168,176,0.1) 100%)' }}
              animate={{ 
                scale: [1, 1.08, 1],
                borderRadius: ['60% 40% 30% 70% / 60% 30% 70% 40%', '30% 60% 70% 40% / 50% 60% 30% 60%', '60% 40% 30% 70% / 60% 30% 70% 40%']
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Main food image */}
            <motion.div 
              className="relative z-10"
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop"
                  alt="Salade fraîche délicieuse"
                  className="w-[280px] h-[280px] lg:w-[440px] lg:h-[440px] object-cover rounded-[2rem] lg:rounded-[3rem] shadow-2xl shadow-black/10 border-4 lg:border-[6px] border-white/80"
                />
              </motion.div>
            </motion.div>

            {/* Floating recipe card - top right */}
            <motion.div 
              className="absolute top-4 right-4 z-20 hidden lg:block"
              initial={{ opacity: 0, x: 30, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
            >
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-black/8 p-4 flex items-center gap-3 border border-white"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center text-2xl">🥗</div>
                <div>
                  <p className="font-bold text-text text-sm">Salade César</p>
                  <p className="text-xs text-textSecondary">15 min • Facile</p>
                </div>
                <div className="ml-2 text-accent text-lg">★</div>
              </motion.div>
            </motion.div>

            {/* Floating recipe card - bottom left */}
            <motion.div 
              className="absolute bottom-8 -left-4 z-20 hidden lg:block"
              initial={{ opacity: 0, x: -30, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0 }}
            >
              <motion.div
                animate={{ y: [5, -7, 5] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-black/8 p-4 flex items-center gap-3 border border-white"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-50 rounded-xl flex items-center justify-center text-2xl">🍝</div>
                <div>
                  <p className="font-bold text-text text-sm">Carbonara</p>
                  <p className="text-xs text-textSecondary">25 min • Moyen</p>
                </div>
                <div className="ml-2">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full">TOP</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating ingredient badges */}
            <motion.div
              className="absolute top-[45%] -left-6 z-20 hidden lg:block"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2, type: 'spring', stiffness: 200 }}
            >
              <motion.div 
                animate={{ y: [-4, 8, -4], rotate: [-5, 5, -5] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 bg-white shadow-lg rounded-2xl flex items-center justify-center text-2xl border border-accent/20"
              >
                🧄
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute bottom-[30%] right-0 z-20 hidden lg:block"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.4, type: 'spring', stiffness: 200 }}
            >
              <motion.div 
                animate={{ y: [6, -6, 6], rotate: [3, -3, 3] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-12 bg-white shadow-lg rounded-2xl flex items-center justify-center text-xl border border-green-100"
              >
                🌿
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute top-2 left-16 z-20 hidden lg:block"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.6, type: 'spring', stiffness: 200 }}
            >
              <motion.div 
                animate={{ y: [-5, 5, -5], x: [-3, 3, -3] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-lg border border-red-100"
              >
                🍅
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Smooth bottom transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 40C240 80 480 80 720 60C960 40 1200 20 1440 40V80H0V40Z" fill="#FFFCF7"/>
        </svg>
      </div>
    </section>
  );
}

