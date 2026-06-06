'use client';

import { useState, useMemo } from 'react';
import { ShopMenuWithImages } from '../actions';
import { MenuCard } from './MenuCard';
import { MealCategory } from '@prisma/client';
import { Reveal } from '@/components/Reveal';

interface MenuGridProps {
  menus: ShopMenuWithImages[];
  /** Play the first row on mount instead of on scroll (when this is the first food section). */
  immediateFirstRow?: boolean;
}

export function MenuGrid({ menus, immediateFirstRow = false }: MenuGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<MealCategory | 'ALL'>('ALL');

  // Filter menus based on selection
  const filteredMenus = useMemo(() => {
    if (selectedCategory === 'ALL') return menus;
    return menus.filter(menu => menu.category === selectedCategory);
  }, [menus, selectedCategory]);

  // Categories available in the data (plus hardcoded standard ones if you prefer, or dynamic)
  // Let's use standard enum values
  const categories: (MealCategory | 'ALL')[] = ['ALL', 'MEAL', 'SNACK', 'DRINK', 'DESSERT', 'TOOL', 'SAUCE'];

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2.5 text-xl font-bold text-gray-900">
          <span className="inline-block h-6 w-1.5 rounded-full bg-gradient-to-b from-[#F97352] to-amber-400" />
          Our Menu
        </h2>

        {/* Category Tabs */}
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all
                ${selectedCategory === cat
                    ? 'bg-[#F97352] text-white shadow-md shadow-orange-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
              `}
            >
              {cat === 'ALL' ? 'All Items' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredMenus.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {filteredMenus.map((menu, i) => (
            <Reveal
              key={menu.id}
              delay={(i % 8) * 0.04}
              y={20}
              immediate={immediateFirstRow && i < 4}
            >
              <MenuCard menu={menu} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 py-20 text-center backdrop-blur-sm">
          <p className="text-gray-500">No items found in this category.</p>
        </div>
      )}
    </section>
  );
}
