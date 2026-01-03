'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/client-api';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const data = await api.checkSession();
        if (mounted) setAuthenticated(Boolean(data?.authenticated));
      } catch (e) {
        if (mounted) setAuthenticated(false);
      }
    }
    check();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      await api.logout();
      // simple reload
      window.location.reload();
    } catch (e) {
      console.error('Logout failed:', e);
      // Still reload to clear state
      window.location.reload();
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="text-3xl group-hover:rotate-12 transition-transform">⚡</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              E-Quickly
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-text hover:text-primary transition-colors font-medium">
              Features
            </a>
            <a href="#grocery-shopping" className="text-text hover:text-primary transition-colors font-medium">
              🛒 Grocery Shopping
            </a>
            <a href="#recipes" className="text-text hover:text-primary transition-colors font-medium">
              Recipes
            </a>
            <a href="#testimonials" className="text-text hover:text-primary transition-colors font-medium">
              Reviews
            </a>
            <a href="/recipe" className="text-text hover:text-primary transition-colors font-medium">
              Protected Recipe
            </a>
          </div>

          {/* CTA / Auth */}
          <div className="hidden md:block">
            {authenticated === null ? (
              <div className="px-6 py-3 text-sm">...</div>
            ) : authenticated ? (
              <div className="flex items-center gap-3">
                <a href="/recipe" className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-surfaceSecondary transition-colors">
                  My Recipes
                </a>
                <a href="/recipe/create" className="px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition-colors">
                  + Create Recipe
                </a>
                <button onClick={handleLogout} className="px-4 py-2 gradient-button text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a href="/login" className="px-4 py-2 rounded border border-border font-medium">Login</a>
                <button className="px-6 py-3 gradient-button text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
                  Download App
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-text"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-text hover:text-primary transition-colors font-medium">
                Features
              </a>
              <a href="#grocery-shopping" className="text-text hover:text-primary transition-colors font-medium">
                🛒 Grocery Shopping
              </a>
              <a href="#recipes" className="text-text hover:text-primary transition-colors font-medium">
                Recipes
              </a>
              <a href="#testimonials" className="text-text hover:text-primary transition-colors font-medium">
                Reviews
              </a>
              <a href="/recipe" className="text-text hover:text-primary transition-colors font-medium">
                My Recipes
              </a>
              {authenticated && (
                <a href="/recipe/create" className="text-primary hover:text-secondary transition-colors font-medium">
                  + Create Recipe
                </a>
              )}
              <div className="flex gap-2">
                {authenticated ? (
                  <button onClick={handleLogout} className="px-4 py-3 gradient-button text-white font-semibold rounded w-full">Logout</button>
                ) : (
                  <a href="/login" className="px-4 py-3 rounded border border-border text-center w-full">Login</a>
                )}
              </div>
              {!authenticated && (
                <button className="px-6 py-3 gradient-button text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 w-full">
                  Download App
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

