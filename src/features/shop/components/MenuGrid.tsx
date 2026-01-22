'use client';

import { useState, useMemo } from 'react';
import { ShopMenuWithImages } from '../actions';
import { MenuCard } from './MenuCard';
import { MealCategory } from '@prisma/client';

interface MenuGridProps {
  menus: ShopMenuWithImages[];
}

export function MenuGrid({ menus }: MenuGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<MealCategory | 'ALL'>('ALL');

  // Filter menus based on selection
  const filteredMenus = useMemo(() => {
    if (selectedCategory === 'ALL') return menus;
    return menus.filter(menu => menu.category === selectedCategory);
  }, [menus, selectedCategory]);

  // Categories available in the data (plus hardcoded standard ones if you prefer, or dynamic)
  // Let's use standard enum values
  const categories: (MealCategory | 'ALL')[] = ['ALL', 'MEAL', 'SNACK', 'DRINK', 'DESSERT'];

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Our Menu</h2>
        
        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${selectedCategory === cat 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              {cat === 'ALL' ? 'All Items' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredMenus.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredMenus.map((menu) => (
            <div key={menu.id}>
              <MenuCard menu={menu} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
           <p className="text-gray-500">No items found in this category.</p>
        </div>
      )}
    </section>
  );
}
