'use client';

import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="px-6 py-3 gradient-button text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
              Download App
            </button>
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
              <button className="px-6 py-3 gradient-button text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 w-full">
                Download App
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

