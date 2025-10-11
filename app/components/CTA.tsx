'use client';

import { toast } from 'sonner';
import { track } from '@vercel/analytics';

export default function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary"></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Start Your
            <br />
            <span className="text-accent">Culinary Adventure?</span>
          </h2>
          
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Join thousands of home cooks discovering recipes, shopping ingredients smarter, and cooking amazing meals every day.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={() => {
                track('Download iOS Clicked', { location: 'cta' });
                toast.success('📱 Opening App Store...', {
                  description: 'Download Quickly for iOS',
                  duration: 3000,
                });
              }}
              className="px-10 py-5 bg-white text-primary font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg flex items-center gap-2"
            >
              <span>📱</span>
              <span>Download for iOS</span>
            </button>
            <button 
              onClick={() => {
                track('Download Android Clicked', { location: 'cta' });
                toast.success('🤖 Opening Play Store...', {
                  description: 'Download Quickly for Android',
                  duration: 3000,
                });
              }}
              className="px-10 py-5 bg-white text-primary font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg flex items-center gap-2"
            >
              <span>🤖</span>
              <span>Download for Android</span>
            </button>
          </div>

          <p className="text-white/80 text-sm">
            Free to download • No credit card required • Start cooking in minutes
          </p>
        </div>
      </div>
    </section>
  );
}

