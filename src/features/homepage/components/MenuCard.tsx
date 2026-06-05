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
  const hasDiscount = discountPrice != null && Number(discountPrice) > 0;
  const formattedDiscountPrice = hasDiscount ? formatPrice(discountPrice!) : null;
  const discountPct = hasDiscount && Number(price) > 0
    ? Math.round((1 - Number(discountPrice) / Number(price)) * 100)
    : 0;

  return (
    <div className="group h-full overflow-hidden rounded-2xl border border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100/60">
      <div className="relative h-32 w-full overflow-hidden bg-gray-100 md:h-40 lg:h-44">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 160px, (max-width: 1024px) 240px, 288px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <span className="text-xs md:text-sm">No Image</span>
          </div>
        )}

        {discountPct > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-[#F97352] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            -{discountPct}%
          </span>
        )}
      </div>

      <div className="p-3 md:p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-gray-800 md:text-base" title={name}>
          {name}
        </h3>

        {formattedDiscountPrice ? (
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-sm font-bold text-[#F97352] md:text-lg">{formattedDiscountPrice}</p>
            <span className="text-xs text-gray-400 line-through decoration-1">{formattedPrice}</span>
          </div>
        ) : (
          <p className="mt-1 text-sm font-bold text-[#F97352] md:text-lg">{formattedPrice}</p>
        )}
      </div>
    </div>
  );
}
