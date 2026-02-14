'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { track } from '@vercel/analytics';
import { motion } from 'framer-motion';

export default function GroceryShopping() {
  const groceryItems = [
    { id: 1, name: "Saumon Frais", qty: "500g", icon: "🐟" },
    { id: 2, name: "Tomates Cerises", qty: "250g", icon: "🍅" },
    { id: 3, name: "Pâtes", qty: "400g", icon: "🍝" },
    { id: 4, name: "Ail", qty: "3 gousses", icon: "🧄" },
    { id: 5, name: "Huile d'Olive", qty: "1 bouteille", icon: "🫒" },
    { id: 6, name: "Basilic Frais", qty: "1 bouquet", icon: "🌿" },
  ];

  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    const item = groceryItems.find(i => i.id === id);
    const isCurrentlyChecked = checkedItems.includes(id);
    
    setCheckedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );

    if (!isCurrentlyChecked && item) {
      toast.success(`${item.icon} ${item.name} ajouté au panier !`, {
        description: `${item.qty} prêt à acheter`,
        duration: 2000,
      });
    }
  };

  const handleGoShopping = () => {
    const remainingItems = totalCount - checkedCount;
    
    track('Go Shopping Button Clicked', {
      items_remaining: remainingItems,
      items_checked: checkedCount,
      total_items: totalCount
    });
    
    if (remainingItems > 0) {
      toast.info(`🛒 ${totalCount - checkedCount} articles prêts pour les courses !`, {
        description: 'Votre liste de courses est préparée',
        duration: 3000,
      });
    } else {
      toast.success('✅ Tous les articles collectés !', {
        description: 'Vous êtes prêt à passer à la caisse',
        duration: 3000,
      });
    }
  };

  const checkedCount = checkedItems.length;
  const totalCount = groceryItems.length;

  return (
    <section className="py-28 bg-background relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-accent/[0.06] rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-[350px] h-[350px] bg-primary/[0.04] rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2 bg-primary/[0.08] text-primary font-semibold rounded-full text-sm tracking-wide border border-primary/[0.12]">
                🛒 COURSES INTELLIGENTES
              </span>
              
              <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-black text-text mt-6 mb-6 leading-[1.15] tracking-[-0.02em]">
                Faites vos courses{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">en un clic</span>
              </h2>
              
              <p className="text-lg text-textSecondary mb-10 leading-relaxed max-w-md">
                N&apos;oubliez plus jamais un ingrédient ! Ajoutez tous les ingrédients de votre planning au panier et faites vos courses intelligemment.
              </p>

              <div className="space-y-3 mb-10">
                {[
                  { icon: '📋', color: 'from-primary/[0.12] to-primary/[0.05]', title: 'Listes Auto-Générées', desc: 'Les ingrédients de tous vos repas planifiés se combinent en une liste organisée.' },
                  { icon: '🛒', color: 'from-accent/[0.15] to-accent/[0.05]', title: 'Panier Intelligent', desc: 'Ajoutez les ingrédients au panier comme dans une boutique en ligne — prêt à acheter.' },
                  { icon: '✅', color: 'from-green-100 to-green-50', title: 'Cochez en Faisant vos Courses', desc: 'Marquez les articles achetés pendant vos courses. Ne ratez plus jamais un ingrédient.' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-border/40 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.04] transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 + 0.2 }}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>{item.icon}</div>
                    <div>
                      <h3 className="font-bold text-text mb-1 text-[15px]">{item.title}</h3>
                      <p className="text-textSecondary text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right - Grocery Cart UI */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="bg-white rounded-3xl shadow-2xl shadow-black/[0.04] p-7 border border-border/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-text">Mon Panier 🛍️</h3>
                  <span className="bg-primary/[0.1] text-primary px-4 py-1.5 rounded-full font-bold text-sm">
                    {totalCount - checkedCount} articles
                  </span>
                </div>

                <div className="space-y-2">
                  {groceryItems.map((item, i) => {
                    const isChecked = checkedItems.includes(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleItem(item.id); } }}
                        role="button"
                        tabIndex={0}
                        aria-label={`${isChecked ? 'Décocher' : 'Cocher'} ${item.name} (${item.qty})`}
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                          isChecked 
                            ? 'bg-green-50/80 border border-green-200/40' 
                            : 'bg-gray-50/60 hover:bg-primary/[0.04] border border-transparent'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: i * 0.05 + 0.3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className={`font-semibold text-sm ${isChecked ? 'line-through text-textSecondary' : 'text-text'}`}>
                              {item.name}
                            </p>
                            <p className="text-xs text-textLight">{item.qty}</p>
                          </div>
                        </div>
                        <Checkbox 
                          checked={isChecked}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-5 border-t border-border/20">
                  <div className="mb-4 text-center">
                    <p className="text-sm text-textSecondary">
                      {checkedCount === totalCount ? (
                        <span className="text-green-600 font-semibold">✅ Tous les articles collectés !</span>
                      ) : (
                        <span>{checkedCount} sur {totalCount} articles cochés</span>
                      )}
                    </p>
                    <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary rounded-full"
                        animate={{ width: `${(checkedCount / totalCount) * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleGoShopping}
                    className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 text-base flex items-center justify-center gap-2"
                  >
                    🛍️ Faire les Courses
                  </button>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div 
                className="absolute -top-4 -right-4 bg-accent text-text px-5 py-2.5 rounded-2xl shadow-xl font-bold text-sm border-4 border-white"
                initial={{ opacity: 0, scale: 0, rotate: 0 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6, type: 'spring', stiffness: 200 }}
              >
                ✨ Tout en un !
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
