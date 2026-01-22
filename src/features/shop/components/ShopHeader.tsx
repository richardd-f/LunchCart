import Image from 'next/image';
import { Shop } from '@prisma/client';

interface ShopHeaderProps {
  shop: Shop;
}

export function ShopHeader({ shop }: ShopHeaderProps) {
  const isOpen = shop.status === 'OPEN';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100/50 overflow-hidden mb-8">
      {/* Cover / Background */}
      <div className="h-10 bg-gradient-to-b from-[#F97352] to-white opacity-90 relative">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10" /> 
      </div>

      <div className="px-6 pb-6 relative bg-gradient-to-t from-white via-white to-orange-500">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6 pt-10 -mt-12">
          
          {/* Profile Image */}
          <div className="relative h-32 w-32 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-white shrink-0">
            {shop.profileImage ? (
              <Image
                src={shop.profileImage}
                alt={shop.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                  <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 007.5 9.75c1.13 0 2.145-.518 2.814-1.35.61.772 1.548 1.35 2.686 1.35 1.24 0 2.29-.63 2.914-1.594a3.73 3.73 0 002.836 1.594c1.13 0 2.145-.518 2.814-1.35.61.772 1.548 1.35 2.686 1.35A3.75 3.75 0 0026.402 4.1l-1.3-1.3a1.875 1.875 0 00-1.325-.55H5.223z" />
                  <path fillRule="evenodd" d="M3 20.25v-8.755c.895.445 1.908.705 3 .705 1.092 0 2.105-.26 3-.705v8.755h-6zM9 20.25v-8.755c.895.445 1.908.705 3 .705 1.092 0 2.105-.26 3-.705v8.755h-6zM15 20.25v-8.755c.895.445 1.908.705 3 .705 1.092 0 2.105-.26 3-.705v8.755h-6z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Shop Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{shop.name}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                   <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${
                      isOpen 
                        ? 'bg-green-50 text-green-700 border-green-100' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {isOpen ? 'OPEN' : 'CLOSED'}
                   </span>
                   <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
                        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.27-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.006.003.002.001.003.001a.75.75 0 01-.01-.319v.319zM8 9a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                      </svg>
                      {shop.address}
                   </span>
                </div>
              </div>
              
              {/* Phone / Contact - Hidden on very small screens or neatly tucked */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
                 </svg>
                 {shop.phone}
              </div>
            </div>

            <p className="mt-3 text-gray-600 text-sm leading-relaxed max-w-2xl">
              {shop.description}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
