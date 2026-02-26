'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/client-api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const data = await api.checkSession();
        if (mounted) setAuthenticated(Boolean(data?.authenticated));
      } catch {
        if (mounted) setAuthenticated(false);
      }
    }
    check();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  async function handleLogout() {
    try {
      await api.logout();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  }

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#recipes', label: 'Recipes' },
    { href: '/recipe', label: 'Explore' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-black/[0.04]' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-text rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <span className="text-3xl group-hover:rotate-12 transition-transform">⚡</span>
            </div>
            <h1 className="text-xl font-black text-text">
              E-Quickly
            </h1>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-textSecondary hover:text-primary rounded-lg hover:bg-primary/[0.05] transition-all duration-200 font-medium text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {authenticated === null ? (
              <div className="px-6 py-3 text-sm text-textLight">...</div>
            ) : authenticated ? (
              <>
                <a href="/recipe" className="px-4 py-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors duration-200">
                  My Recipes
                </a>
                <a href="/recipe/create" className="px-4 py-2.5 text-sm font-semibold text-primary border border-primary/30 rounded-xl hover:bg-primary hover:text-white transition-all duration-200">
                  + Create
                </a>
                <button onClick={handleLogout} className="px-5 py-2.5 bg-gray-100 text-text text-sm font-bold rounded-xl hover:bg-gray-200 transition-all duration-200">
                  Log out
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="px-4 py-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors duration-200">
                  Sign in
                </a>
                {/* <a href="/recipe" className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all duration-200">
                  Explore recipes
                </a> */}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-5 h-5 text-text" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-border/30"
            >
              <div className="py-5 flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-4 py-3 text-text hover:text-primary hover:bg-primary/[0.05] rounded-xl transition-all duration-200 font-medium text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </motion.a>
                ))}
                <div className="h-px bg-border/20 my-2"></div>
                {authenticated ? (
                  <>
                    <a href="/recipe/create" className="px-4 py-3 text-primary font-semibold hover:bg-primary/[0.05] rounded-xl transition-all">
                      + Create a recipe
                    </a>
                    <button onClick={handleLogout} className="mx-4 py-3 bg-text text-white font-bold rounded-xl text-sm">
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/login" className="px-4 py-3 text-text font-medium hover:bg-gray-50 rounded-xl transition-all text-center text-sm">
                      Sign in
                    </a>
                    {/* <a href="/recipe" className="mx-4 py-3 bg-primary text-white font-bold rounded-xl text-center text-sm">
                      Explore recipes
                    </a> */}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
