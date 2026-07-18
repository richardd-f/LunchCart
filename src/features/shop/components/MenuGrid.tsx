'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ShopMenuWithImages, getShopMenusPage } from '../actions';
import { MENU_PAGE_SIZE } from '../pagination';
import { MenuCard } from './MenuCard';
import { MealCategory } from '@prisma/client';

interface MenuGridProps {
  shopId: string;
  initialMenus: ShopMenuWithImages[];
  initialHasMore: boolean;
}

export function MenuGrid({
  shopId,
  initialMenus,
  initialHasMore,
}: MenuGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<MealCategory | 'ALL'>('ALL');
  const [menus, setMenus] = useState<ShopMenuWithImages[]>(initialMenus);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isSwitching, setIsSwitching] = useState(false); // category change (list reset)
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Bumped on every fetch so late responses from a previous category are ignored.
  const requestIdRef = useRef(0);

  const loadPage = useCallback(
    async (category: MealCategory | 'ALL', offset: number, append: boolean) => {
      const requestId = ++requestIdRef.current;
      if (append) setIsLoadingMore(true);
      else setIsSwitching(true);

      const result = await getShopMenusPage(shopId, {
        category: category === 'ALL' ? undefined : category,
        offset,
        take: MENU_PAGE_SIZE,
      });

      if (requestId !== requestIdRef.current) return; // stale response

      if (result.success && result.data) {
        const page = result.data;
        setMenus((prev) => {
          if (!append) return page.menus;
          // Offset pagination can overlap if the list changed server-side; drop dupes.
          const seen = new Set(prev.map((m) => m.id));
          return [...prev, ...page.menus.filter((m) => !seen.has(m.id))];
        });
        setHasMore(page.hasMore);
      }
      setIsSwitching(false);
      setIsLoadingMore(false);
    },
    [shopId]
  );

  const handleCategoryChange = (category: MealCategory | 'ALL') => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    setMenus([]);
    setHasMore(false);
    loadPage(category, 0, false);
  };

  // Keep the latest load-more logic in a ref so the observer is created once.
  const loadMoreRef = useRef<() => void>(() => {});
  loadMoreRef.current = () => {
    if (!hasMore || isSwitching || isLoadingMore) return;
    loadPage(selectedCategory, menus.length, true);
  };

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreRef.current();
      },
      // ~one card-row ahead: the next page is fetched before the user reaches the end.
      { rootMargin: '300px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Categories available in the data (plus hardcoded standard ones if you prefer, or dynamic)
  // Let's use standard enum values
  const categories: (MealCategory | 'ALL')[] = ['ALL', 'MEAL', 'SNACK', 'DRINK', 'DESSERT', 'TOOL', 'SAUCE'];

  const formatCategory = (cat: MealCategory) => cat.charAt(0) + cat.slice(1).toLowerCase();

  // "All Items" arrives category-sorted from the backend, so consecutive
  // slices per category form the grouped sections (they extend as pages load).
  const categoryGroups: { category: MealCategory; items: ShopMenuWithImages[] }[] = [];
  if (selectedCategory === 'ALL') {
    for (const menu of menus) {
      const lastGroup = categoryGroups[categoryGroups.length - 1];
      if (lastGroup && lastGroup.category === menu.category) lastGroup.items.push(menu);
      else categoryGroups.push({ category: menu.category, items: [menu] });
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="flex items-center gap-2.5 text-xl font-bold text-gray-900">
          <span className="inline-block h-6 w-1.5 rounded-full bg-gradient-to-b from-[#F97352] to-amber-400" />
          Our Menu
        </h2>

        {/* Category Tabs */}
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
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

      {menus.length > 0 ? (
        selectedCategory === 'ALL' ? (
          <div className="flex flex-col gap-8">
            {categoryGroups.map((group) => (
              <div key={group.category}>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                  <span className="inline-block h-5 w-1 rounded-full bg-gradient-to-b from-[#F97352] to-amber-400" />
                  {formatCategory(group.category)}
                </h3>
                <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
                  {group.items.map((menu) => (
                    <MenuCard key={menu.id} menu={menu} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {menus.map((menu) => (
              <MenuCard key={menu.id} menu={menu} />
            ))}
          </div>
        )
      ) : isSwitching ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#F97352] border-t-transparent" />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 py-20 text-center backdrop-blur-sm">
          <p className="text-gray-500">No items found in this category.</p>
        </div>
      )}

      {/* Infinite-scroll sentinel + loading indicator */}
      <div ref={sentinelRef} aria-hidden="true" />
      {isLoadingMore && (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#F97352] border-t-transparent" />
        </div>
      )}
    </section>
  );
}
