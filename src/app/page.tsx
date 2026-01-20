import { getHomepageData } from '@/features/homepage/actions';
import { SearchBar } from '@/features/homepage/components/SearchBar';
import { ShopSection } from '@/features/homepage/components/ShopSection';
import React from 'react';

export const dynamic = 'force-dynamic'; // Ensure we get fresh data since it might change often

export default async function Home() {
  const shops = await getHomepageData();

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
        
        <SearchBar />
      </div>

      <div className="max-w-4xl mx-auto mt-4 space-y-2">
        {shops.map((shop) => (
           <ShopSection 
             key={shop.id}
             shopId={shop.id}
             shopName={shop.name}
             meals={shop.meals.map(m => ({
               ...m,
               price: Number(m.price) // Convert Decimal to Number/String for the component
             }))}
           />
        ))}

        {shops.length === 0 && (
          <div className="text-center py-20 px-4">
             <p className="text-gray-500">Toko sedang tutup atau belum ada menu yang tersedia.</p>
          </div>
        )}
      </div>
    </main>
  );
}
