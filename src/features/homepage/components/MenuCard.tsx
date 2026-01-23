import Image from 'next/image';
import React from 'react';

interface MenuCardProps {
  name: string;
  price: number | string;
  imageUrl?: string | null;
}

export function MenuCard({ name, price, imageUrl }: MenuCardProps) {
  // Format price to IDR
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price));

  return (
    <div className="flex-shrink-0 w-40 sm:w-48 md:w-60 lg:w-72 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden snap-start hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-32 md:h-40 lg:h-48 w-full bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 160px, (max-width: 1024px) 240px, 288px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-xs md:text-sm">No Image</span>
          </div>
        )}
      </div>
      <div className="p-3 md:p-4">
        <h3 className="text-sm md:text-lg font-semibold text-gray-800 line-clamp-1" title={name}>
          {name}
        </h3>
        <p className="mt-1 text-sm md:text-lg font-bold text-[#F97352]">
          {formattedPrice}
        </p>
      </div>
    </div>
  );
}
