import Link from 'next/link';
import React from 'react';
import { MenuCard } from './MenuCard';

interface ShopSectionProps {
  shopId: number;
  shopName: string;
  meals: Array<{
    id: number;
    name: string;
    price: number | string; // Handle Decimal from Prisma
    imageUrl?: string | null;
  }>;
}

export function ShopSection({ shopId, shopName, meals }: ShopSectionProps) {
  if (meals.length === 0) return null;

  return (
    <div className="mb-8 last:mb-24">
      <div className="flex justify-between items-center px-4 mb-3">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
           {shopName}
        </h2>
        <Link href={`/shop/${shopId}`} className="text-xs font-semibold text-[#F97352] hover:text-[#e05f3e]">
          Lihat Semua
        </Link>
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory scrollbar-hide">
        {meals.map((meal) => (
          <Link key={meal.id} href={`/menu/${meal.id}`} className="block">
            <MenuCard 
              name={meal.name}
              price={meal.price.toString()} // Ensure Decimal is converted to string for display props
              imageUrl={meal.imageUrl}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
