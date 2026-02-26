'use client';

import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F1A2E] via-[#142233] to-[#0F1A2E]"></div>
      
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/[0.08] rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/[0.08] rounded-full blur-[120px]"></div>

      {/* Floating food emojis with Framer Motion */}
      <motion.div
        className="absolute top-16 left-[10%] text-6xl opacity-[0.15]"
        animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >🍕</motion.div>
      <motion.div
        className="absolute top-24 right-[15%] text-5xl opacity-[0.15]"
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >🥗</motion.div>
      <motion.div
        className="absolute bottom-20 left-[20%] text-5xl opacity-[0.15]"
        animate={{ y: [0, -18, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >🍰</motion.div>
      <motion.div
        className="absolute bottom-16 right-[10%] text-6xl opacity-[0.15]"
        animate={{ y: [0, 14, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      >🍜</motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/[0.08] text-white/80 font-semibold rounded-full text-sm mb-8 tracking-wide border border-white/[0.08]">
            🚀 START NOW
          </span>

          <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-white mb-6 leading-[1.15] tracking-[-0.02em]">
            Ready to start your
            <br />
            <span className="bg-gradient-to-r from-primary via-[#5DD4C8] to-accent bg-clip-text text-transparent">culinary adventure?</span>
          </h2>
          
          <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto leading-relaxed">
            Join thousands of cooks discovering recipes, shopping smarter, and making incredible meals every day.
          </p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <a
              href="/recipe"
              className="px-10 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 text-base flex items-center gap-2"
            >
              <span>🍽️</span>
              <span>Explore Recipes</span>
            </a>
            <a
              href="/login"
              className="px-10 py-4 bg-white text-text font-bold rounded-xl border-2 border-white hover:bg-white/90 transition-all duration-200 text-base flex items-center gap-2"
            >
              <span>✨</span>
              <span>Create an Account</span>
            </a>
          </motion.div>

          <motion.p
            className="text-white/35 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Free • No credit card required • Start cooking in minutes
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
