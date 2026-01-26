import Link from 'next/link';
import React from 'react';
import { MenuCard } from './MenuCard';

interface ShopSectionProps {
  shopId: string;
  shopName: string;
  meals: Array<{
    id: string;
    name: string;
    price: number | string;
    images: Array<{ imagePath: string }>;
  }>;
}

export function ShopSection({ shopId, shopName, meals }: ShopSectionProps) {
  if (meals.length === 0) return null;

  return (
    <div className="mb-8 last:mb-24">
      <div className="flex justify-between items-center px-4 mb-3">
        <h2 className="text-lg md:text-2xl font-bold text-gray-800 flex items-center gap-2">
           {shopName}
        </h2>
        <Link href={`/shop/${shopId}`} className="text-xs font-semibold text-[#F97352] hover:text-[#e05f3e]">
          Lihat Semua
        </Link>
      </div>
      
      {/* Row 1 */}
      <div className="flex overflow-x-auto gap-4 px-6 pb-4 snap-x snap-mandatory scrollbar-hide">
        {meals.filter((_, i) => i % 2 === 0).map((meal) => (
          <Link key={meal.id} href={`/menu/${meal.id}`} className="block flex-shrink-0 w-40 sm:w-48 md:w-60 lg:w-72">
            <MenuCard 
              name={meal.name}
              price={meal.price.toString()}
              imageUrl={meal.images[0]?.imagePath}
            />
          </Link>
        ))}
      </div>

      {/* Row 2 */}
      {meals.length > 1 && (
        <div className="flex overflow-x-auto gap-4 px-6 -mt-2 pb-4 snap-x snap-mandatory scrollbar-hide">
          {meals.filter((_, i) => i % 2 !== 0).map((meal) => (
            <Link key={meal.id} href={`/menu/${meal.id}`} className="block flex-shrink-0 w-40 sm:w-48 md:w-60 lg:w-72">
              <MenuCard 
                name={meal.name}
                price={meal.price.toString()}
                imageUrl={meal.images[0]?.imagePath}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
