'use client';

import { toast } from 'sonner';
import { track } from '@vercel/analytics';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-primary">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Your Recipe Journey
            <br />
            <span className="text-accent">Starts Here</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Discover, save, and cook amazing recipes from videos with AI. Plan your meals, add ingredients to your grocery cart, and shop smarter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={() => {
                track('Download App Clicked', { location: 'hero' });
                toast.success('📱 Redirecting to App Store...', {
                  description: 'Get Quickly on your mobile device',
                  duration: 3000,
                });
              }}
              className="px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg"
            >
              Download App
            </button>
            <button 
              onClick={() => {
                track('Watch Demo Clicked', { location: 'hero' });
                toast.info('🎬 Demo Video Coming Soon!', {
                  description: 'Watch how Quickly transforms your cooking',
                  duration: 3000,
                });
              }}
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 text-lg border-2 border-white/50"
            >
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {[
              { value: "50K+", label: "Recipes" },
              { value: "10K+", label: "Users" },
              { value: "1M+", label: "Meals Cooked" },
              { value: "4.9★", label: "Rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
}

