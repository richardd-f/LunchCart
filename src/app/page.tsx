import { getHomepageData } from '@/features/homepage/actions';
import { SearchBar } from '@/features/homepage/components/SearchBar';
import { ShopSection } from '@/features/homepage/components/ShopSection';
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
    return (
      <main className="min-h-screen bg-white pb-10">
        <div className="max-w-4xl mx-auto text-center py-20 px-4">
          <p className="text-red-500 font-medium">Terjadi kesalahan</p>
          <p className="text-gray-500 text-sm mt-2">
            {typeof result.error === 'string' ? result.error : 'Gagal memuat data'}
          </p>
        </div>
      </main>
    );
  }

  const shops = result.data ?? [];

  return (
    <main className="min-h-screen bg-white pb-10">
      {/* Header / Hero Section (Simple) */}
      <div className="bg-gradient-to-b from-[#F97352]/10 to-white pt-8 pb-4 px-4 rounded-b-[2rem]">
        <div className="max-w-4xl mx-auto text-center mb-6">
          <h1 className="text-2xl font-bold text-[#F97352] mb-2">
            LunchCart
          </h1>
          <p className="text-gray-500 text-sm">
            Pesan makan di kantin jadi lebih mudah.
          </p>
        </div>
        
        <Suspense fallback={<div className="w-full max-w-md mx-auto mb-6 h-12 bg-gray-100 rounded-full animate-pulse" />}>
          <SearchBar />
        </Suspense>
      </div>

      <div className="max-w-6xl mx-auto mt-4 space-y-2">
        {searchQuery && (
          <div className="px-4 mb-4">
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
             meals={shop.meals.map(m => ({
               id: m.id,
               name: m.name,
               price: Number(m.price),
               images: m.images,
             }))}
           />
        ))}

        {shops.length === 0 && (
          <div className="text-center py-20 px-4">
            {searchQuery ? (
              <>
                <p className="text-gray-500">Tidak ada hasil untuk &quot;{searchQuery}&quot;</p>
                <p className="text-gray-400 text-sm mt-2">Coba kata kunci lain.</p>
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
