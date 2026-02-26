import type { Metadata } from 'next';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import GroceryShopping from './components/GroceryShopping';
import RecipeShowcase from './components/RecipeShowcase';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';

export const metadata: Metadata = {
  title: 'E-Quickly — Smart Recipes & Shopping',
  description: 'Discover delicious recipes, plan your meals, and shop smarter with E-Quickly.',
};

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <Hero />
      <div id="features">
        <Features />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="grocery-shopping">
        <GroceryShopping />
      </div>
      <div id="recipes">
        <RecipeShowcase />
      </div>
      <div id="testimonials">
        <Testimonials />
      </div>
      <CTA />
      <Footer />
      <BackToTop />
    </main>
  );
}
