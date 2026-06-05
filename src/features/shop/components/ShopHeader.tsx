import Image from 'next/image';
import { Shop } from '@prisma/client';

interface ShopHeaderProps {
  shop: Shop;
}

export function ShopHeader({ shop }: ShopHeaderProps) {
  const isOpen = shop.status === 'OPEN';

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border border-orange-100 bg-white/80 shadow-sm shadow-orange-100/50 backdrop-blur-sm">
      {/* Cover / Banner */}
      <div className="relative h-28 bg-gradient-to-r from-[#F97352] via-orange-400 to-amber-400 sm:h-32">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)',
            backgroundSize: '22px 22px',
          }}
        />
      </div>

      <div className="px-5 pb-6 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          {/* Profile Image */}
          <div className="relative -mt-14 h-28 w-28 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg sm:-mt-16 sm:h-32 sm:w-32">
            {shop.profileImage ? (
              <Image src={shop.profileImage} alt={shop.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-orange-50 text-4xl font-bold text-orange-300">
                {shop.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Title + Status */}
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:pb-1">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{shop.name}</h1>
              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${
                  isOpen
                    ? 'border-green-100 bg-green-50 text-green-700'
                    : 'border-red-100 bg-red-50 text-red-700'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                {isOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Info chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {shop.address && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[#F97352]">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.27-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.006.003.002.001.003.001a.75.75 0 01-.01-.319v.319zM8 9a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
              </svg>
              {shop.address}
            </span>
          )}
          {shop.phone && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[#F97352]">
                <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
              </svg>
              {shop.phone}
            </span>
          )}
        </div>

        {shop.description && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600">{shop.description}</p>
        )}
      </div>
    </div>
  );
}
