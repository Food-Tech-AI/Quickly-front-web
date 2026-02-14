'use client';

import { testimonials } from '../data/fakeData';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Testimonials() {
  return (
    <section className="py-28 bg-background relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/[0.06] rounded-full blur-3xl"></div>
      <div className="absolute top-20 left-0 w-72 h-72 bg-primary/[0.04] rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-accent/[0.15] text-text font-semibold rounded-full text-sm tracking-wide border border-accent/[0.1]">
            💬 TÉMOIGNAGES
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-text mt-6 mb-5 leading-[1.15] tracking-[-0.02em]">
            Adoré par les{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Cuisiniers</span>
          </h2>
          <p className="text-lg text-textSecondary max-w-lg mx-auto leading-relaxed">
            Découvrez ce que notre communauté dit de son expérience culinaire.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="bg-white p-7 rounded-2xl border border-border/30 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/[0.06] transition-colors duration-300"
            >
              {/* Stars */}
              <div className="mb-4 flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-[18px] h-[18px] ${i < testimonial.rating ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-text leading-relaxed mb-6 text-[15px]">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/20">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={42}
                  height={42}
                  className="rounded-full ring-2 ring-primary/10"
                />
                <div>
                  <h4 className="font-bold text-text text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-textLight">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

