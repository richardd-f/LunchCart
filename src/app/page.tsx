import { getHomepageData } from '@/features/homepage/actions';
import { getMealDiscountPreview } from '@/features/discounts/getMealDiscountPreview';
import { SearchBar } from '@/features/homepage/components/SearchBar';
import { ShopSection } from '@/features/homepage/components/ShopSection';
import Image from 'next/image';
import React, { Suspense } from 'react';

export const dynamic = 'force-dynamic'; // Ensure we get fresh data since it might change often

interface HomeProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const searchQuery = params.q || '';
  const result = await getHomepageData(searchQuery);

  // Handle error state
  if (!result.success) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Gagal memuat data');
  }

  const shops = result.data ?? [];

  return (
    <main className="flex flex-1 flex-col pb-10">
      {/* Hero Section */}
      <section className="relative mb-8 h-[400px] w-full overflow-hidden rounded-b-[3rem]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/header.webp"
            alt="School Lunch Header"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/60" />

        {/* Content Container */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <div className="mb-8 max-w-4xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-5xl">
              Reimagining School Lunch
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/90 drop-shadow-sm md:text-xl">
              LunchCart, making your break time actually yours.
            </p>
          </div>

          <div className="w-full max-w-lg">
            <Suspense fallback={<div className="mx-auto h-12 w-full max-w-md animate-pulse rounded-full bg-white/20 shadow-lg backdrop-blur-md" />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-4 flex w-full max-w-6xl flex-1 flex-col space-y-2">
        {searchQuery && (
          <div className="mb-4 px-4">
            <p className="text-sm text-gray-600">
              Hasil pencarian untuk: <span className="font-semibold text-[#F97352]">&quot;{searchQuery}&quot;</span>
            </p>
          </div>
        )}

        {shops.map((shop) => (
          <ShopSection
            key={shop.id}
            shopId={shop.id}
            shopName={shop.name}
            meals={shop.meals.map((m) => ({
              id: m.id,
              name: m.name,
              price: Number(m.price),
              hasActiveDiscount: m.discounts.length > 0,
              discountPreview: getMealDiscountPreview(
                Number(m.price),
                m.discounts.map((d) => ({
                  percentage: Number(d.percentage),
                  minOrderSubtotal: Number(d.minOrderSubtotal),
                  maxDiscountAmount: Number(d.maxDiscountAmount),
                }))
              ),
              images: m.images,
            }))}
          />
        ))}

        {shops.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
            {searchQuery ? (
              <>
                <p className="text-gray-500">Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
                <p className="mt-2 text-sm text-gray-400">Coba kata kunci lain.</p>
              </>
            ) : (
              <p className="text-gray-500">Toko sedang tutup atau belum ada menu yang tersedia.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
