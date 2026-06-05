import Link from 'next/link';
import React from 'react';
import { MenuCard } from './MenuCard';
import { Reveal } from '@/components/Reveal';

interface ShopSectionProps {
  shopId: string;
  shopName: string;
  meals: Array<{
    id: string;
    name: string;
    price: number | string;
    discountPrice?: number | string; // Optional field
    images: Array<{ imagePath: string }>;
  }>;
}

export function ShopSection({ shopId, shopName, meals }: ShopSectionProps) {
  if (meals.length === 0) return null;

  const evenMeals = meals.filter((_, i) => i % 2 === 0);
  const oddMeals = meals.filter((_, i) => i % 2 !== 0);

  const cardWidth = 'w-40 flex-shrink-0 snap-start sm:w-48 md:w-60 lg:w-64';

  return (
    <Reveal className="mb-10 last:mb-24">
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="flex items-center gap-2.5 text-lg font-bold text-gray-800 md:text-2xl">
          <span className="inline-block h-6 w-1.5 rounded-full bg-gradient-to-b from-[#F97352] to-amber-400" />
          {shopName}
        </h2>
        <Link
          href={`/shop/${shopId}`}
          className="rounded-full bg-orange-50 px-3.5 py-1.5 text-xs font-semibold text-[#F97352] transition-all hover:bg-[#F97352] hover:text-white hover:shadow-md hover:shadow-orange-200"
        >
          Lihat Semua
        </Link>
      </div>

      {/* Row 1 */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide">
        {evenMeals.map((meal, i) => (
          <Reveal key={meal.id} delay={i * 0.05} y={20} className={cardWidth}>
            <Link href={`/menu/${meal.id}`} className="block h-full">
              <MenuCard
                name={meal.name}
                price={meal.price.toString()}
                discountPrice={meal.discountPrice}
                imageUrl={meal.images[0]?.imagePath}
              />
            </Link>
          </Reveal>
        ))}
      </div>

      {/* Row 2 */}
      {meals.length > 1 && (
        <div className="-mt-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide">
          {oddMeals.map((meal, i) => (
            <Reveal key={meal.id} delay={i * 0.05} y={20} className={cardWidth}>
              <Link href={`/menu/${meal.id}`} className="block h-full">
                <MenuCard
                  name={meal.name}
                  price={meal.price.toString()}
                  discountPrice={meal.discountPrice}
                  imageUrl={meal.images[0]?.imagePath}
                />
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </Reveal>
  );
}
