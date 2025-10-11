'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { track } from '@vercel/analytics';

export default function GroceryShopping() {
  const groceryItems = [
    { id: 1, name: "Fresh Salmon", qty: "500g", icon: "🐟" },
    { id: 2, name: "Cherry Tomatoes", qty: "250g", icon: "🍅" },
    { id: 3, name: "Pasta", qty: "400g", icon: "🍝" },
    { id: 4, name: "Garlic", qty: "3 cloves", icon: "🧄" },
    { id: 5, name: "Olive Oil", qty: "1 bottle", icon: "🫒" },
    { id: 6, name: "Fresh Basil", qty: "1 bunch", icon: "🌿" },
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
      toast.success(`${item.icon} ${item.name} added to cart!`, {
        description: `${item.qty} ready to buy`,
        duration: 2000,
      });
    }
  };

  const handleGoShopping = () => {
    const remainingItems = totalCount - checkedCount;
    
    // Track button click
    track('Go Shopping Button Clicked', {
      items_remaining: remainingItems,
      items_checked: checkedCount,
      total_items: totalCount
    });
    
    if (remainingItems > 0) {
      toast.info(`🛒 ${totalCount - checkedCount} items ready for shopping!`, {
        description: 'Your grocery list is prepared',
        duration: 3000,
      });
    } else {
      toast.success('✅ All items collected!', {
        description: 'You\'re ready to checkout',
        duration: 3000,
      });
    }
  };

  const checkedCount = checkedItems.length;
  const totalCount = groceryItems.length;

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 text-9xl">🛒</div>
        <div className="absolute bottom-20 right-20 text-9xl">🥗</div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div>
              <div className="inline-block px-4 py-2 bg-primary/20 rounded-full mb-6">
                <span className="text-primary font-semibold">🛒 Smart Shopping</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-text mb-6">
                Shop Your Ingredients
                <br />
                <span className="text-primary">With One Click</span>
              </h2>
              
              <p className="text-xl text-textSecondary mb-8 leading-relaxed">
                Never forget an ingredient again! Add all your meal plan ingredients to your grocery cart and shop smarter.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 bg-surface p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl mt-1">📋</div>
                  <div>
                    <h3 className="font-bold text-text text-lg mb-1">Auto-Generated Lists</h3>
                    <p className="text-textSecondary">Ingredients from all your planned meals automatically combine into one organized list.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-surface p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl mt-1">🛒</div>
                  <div>
                    <h3 className="font-bold text-text text-lg mb-1">Smart Grocery Cart</h3>
                    <p className="text-textSecondary">Add ingredients to your cart like an online shopping basket - ready to buy at your favorite store.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-surface p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-3xl mt-1">✅</div>
                  <div>
                    <h3 className="font-bold text-text text-lg mb-1">Check Off as You Shop</h3>
                    <p className="text-textSecondary">Mark items as purchased while shopping. Never miss an ingredient or buy duplicates.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  track('Start Shopping Smarter Clicked');
                  toast.success('🎉 Welcome to Quickly!', {
                    description: 'Download the app to start shopping smarter',
                    duration: 3000,
                  });
                }}
                className="px-8 py-4 gradient-button text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 text-lg"
              >
                Start Shopping Smarter
              </button>
            </div>

            {/* Right side - Visual representation */}
            <div className="relative">
              <div className="bg-surface rounded-2xl shadow-2xl p-8 border-2 border-primary/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-text">My Grocery Cart</h3>
                  <span className="bg-primary text-white px-4 py-2 rounded-full font-bold">
                    {totalCount - checkedCount} items
                  </span>
                </div>

                <div className="space-y-3">
                  {groceryItems.map((item) => {
                    const isChecked = checkedItems.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                          isChecked 
                            ? 'bg-success/10 opacity-60' 
                            : 'bg-backgroundSecondary hover:bg-primary/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className={`font-semibold ${isChecked ? 'line-through text-textSecondary' : 'text-text'}`}>
                              {item.name}
                            </p>
                            <p className="text-sm text-textSecondary">{item.qty}</p>
                          </div>
                        </div>
                        <Checkbox 
                          checked={isChecked}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="mb-4 text-center">
                    <p className="text-sm text-textSecondary mb-1">Click checkboxes to mark as collected</p>
                    <p className="text-lg font-bold text-text">
                      {checkedCount === totalCount ? (
                        <span className="text-success">✅ All items collected!</span>
                      ) : (
                        <span>{checkedCount} of {totalCount} items checked</span>
                      )}
                    </p>
                  </div>
                  <button 
                    onClick={handleGoShopping}
                    className="w-full py-5 bg-gradient-to-r from-[#40E0D8] to-[#5EBEC4] text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-lg flex items-center justify-center gap-3 group shadow-lg"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform">🛍️</span>
                    <span className="text-xl">Go Shopping at Your Store</span>
                  </button>
                  <p className="text-xs text-center text-textSecondary mt-3">
                    💡 This list is ready for your favorite grocery store
                  </p>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-accent text-text px-6 py-3 rounded-full shadow-xl font-bold transform rotate-12 border-4 border-white">
                ✨ All in One Place!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
