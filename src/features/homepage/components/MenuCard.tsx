import Image from 'next/image';
import React from 'react';

interface MenuCardProps {
  name: string;
  price: number | string;
  discountPrice?: number | string;
  imageUrl?: string | null;
}

export function MenuCard({ name, price, discountPrice, imageUrl }: MenuCardProps) {
  // Format price helper
  const formatPrice = (amount: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formattedPrice = formatPrice(price);
  const formattedDiscountPrice = discountPrice && Number(discountPrice) > 0 ? formatPrice(discountPrice) : null;

  return (
    <div className="flex-shrink-0 w-full bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden snap-start hover:shadow-lg transition-shadow duration-300">
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
        
        {formattedDiscountPrice ? (
             <div className="mt-1 flex flex-col">
                  <span className="text-xs text-gray-400 line-through decoration-1 decoration-gray-400">
                      {formattedPrice}
                  </span>
                  <p className="text-sm md:text-lg font-bold text-[#F97352]">
                      {formattedDiscountPrice}
                  </p>
             </div>
        ) : (
             <p className="mt-1 text-sm md:text-lg font-bold text-[#F97352]">
                  {formattedPrice}
             </p>
        )}

      </div>
    </div>
  );
}
