'use client';

import { howItWorks } from '../data/fakeData';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #FFF9F0 0%, #FFFCF7 100%)' }}>
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/[0.03] rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2  text-text font-semibold rounded-full text-sm tracking-wide border border-accent/[0.15]">
            🚀 COMMENT ÇA MARCHE
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-text mt-6 mb-5 leading-[1.15] tracking-[-0.02em]">
            Simple comme{' '}
            <span className="from-primary to-secondary bg-clip-text">1, 2, 3, 4</span>
          </h2>
          <p className="text-lg text-textSecondary max-w-lg mx-auto leading-relaxed">
            De la découverte à la cuisine — tout en quatre étapes simples.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div 
                key={index} 
                className="relative text-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
              >
                {/* Connector line */}
                {index < howItWorks.length - 1 && index !== 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-[2px]">
                    <motion.div 
                      className="w-full h-full bg-gradient-to-r from-primary/[0.3] to-primary/[0.05] rounded-full"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                      style={{ transformOrigin: 'left' }}
                    />
                  </div>
                )}

                {/* Step icon */}
                <motion.div 
                  className="relative inline-flex items-center justify-center mb-8"
                  whileHover={{ scale: 1.12, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-lg shadow-primary/[0.08] flex items-center justify-center text-5xl border border-primary/[0.08]">
                    {step.icon}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg shadow-primary/20">
                    {step.step}
                  </div>
                </motion.div>

                <h3 className="text-lg font-bold text-text mb-2">
                  {step.title}
                </h3>
                <p className="text-textSecondary text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

