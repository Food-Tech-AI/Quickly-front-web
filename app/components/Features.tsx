'use client';

import { features } from '../data/fakeData';
import { motion } from 'framer-motion';

export default function Features() {
  return (
    <section className="py-28 bg-background relative overflow-hidden">
      {/* Subtle bg accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.06] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-primary/[0.08] text-primary font-semibold rounded-full text-sm tracking-wide border border-primary/[0.12]">
            ✨ FONCTIONNALITÉS
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-text mt-6 mb-5 leading-[1.15] tracking-[-0.02em]">
            Tout ce qu&apos;il faut pour{' '}
            <span className="from-primary to-secondary bg-clip-text">cuisiner mieux</span>
          </h2>
          <p className="text-lg text-textSecondary max-w-lg mx-auto leading-relaxed">
            Des fonctionnalités puissantes conçues pour rendre votre expérience culinaire fluide et agréable.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative bg-white p-7 rounded-2xl border border-border/40 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/[0.06] transition-colors duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-primary/[0.12] to-secondary/[0.08] rounded-2xl flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-text mb-2.5 group-hover:text-primary transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-textSecondary leading-relaxed text-[15px]">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

