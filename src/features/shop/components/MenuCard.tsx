import Image from 'next/image';
import Link from 'next/link';
import { ShopMenuWithImages } from '../actions';
import { MealCategory } from '@prisma/client';
import { MenuCardAddButton } from './MenuCardAddButton';

interface MenuCardProps {
  menu: ShopMenuWithImages;
}

export function MenuCard({ menu }: MenuCardProps) {
  const primaryImage = menu.images.find(img => img.isPrimary)?.imagePath || menu.images[0]?.imagePath;

  // Format price to IDR
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(menu.price));

  return (
    <Link href={`/menu/${menu.id}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-100/60">
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={menu.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <span className="text-xs">No Image</span>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] uppercase font-bold tracking-wider rounded-md text-gray-800 shadow-sm border border-gray-100">
              {menu.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-[#F97352] transition-colors">
            {menu.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2 mb-3 flex-1">
            {menu.description}
          </p>
          
          <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-50">
             <div className="flex flex-col">
                {menu.discountPrice > 0 && (
                    <span className="text-xs text-gray-400 line-through decoration-1 decoration-gray-400">
                      {formattedPrice}
                    </span>
                )}
                <span className={`font-bold text-gray-900 text-lg ${menu.discountPrice > 0 ? 'text-[#F97352]' : ''}`}>
                    {menu.discountPrice > 0 
                      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(menu.discountPrice)
                      : formattedPrice}
                </span>
             </div>
             
             <MenuCardAddButton mealId={menu.id} />
          </div>
        </div>
      </div>
    </Link>
  );
}
