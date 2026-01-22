import Image from 'next/image';
import Link from 'next/link';
import { ShopMenuWithImages } from '../actions';
import { MealCategory } from '@prisma/client';

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
    <Link href={`/menu/${menu.id}`} className="block group h-full">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full hover:shadow-md transition-shadow duration-300 flex flex-col">
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
          
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
             <span className="font-bold text-gray-900 text-lg">
                {formattedPrice}
             </span>
             <button className="w-8 h-8 rounded-full bg-orange-50 text-[#F97352] flex items-center justify-center hover:bg-[#F97352] hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
             </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
