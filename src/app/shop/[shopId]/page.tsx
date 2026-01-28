import { notFound } from 'next/navigation';
import { getShopDetails, getShopMenus, getNewShopMenus } from '@/features/shop/actions';
import { ShopHeader } from '@/features/shop/components/ShopHeader';
import { NewMenuSection } from '@/features/shop/components/NewMenuSection';
import { MenuGrid } from '@/features/shop/components/MenuGrid';

interface PageProps {
  params: Promise<{ shopId: string }>;
}

export default async function ShopPage({ params }: PageProps) {
  const { shopId } = await params;

  // 1. Fetch Shop Details
  const shopResult = await getShopDetails(shopId);
  if (!shopResult.success || !shopResult.data) {
    notFound();
  }
  const shop = shopResult.data;

  // 2. Fetch All Menus
  const allMenusResult = await getShopMenus(shopId);
  const allMenus = allMenusResult.success && allMenusResult.data ? allMenusResult.data : [];

  // 3. Fetch New Menus (e.g., limit 5)
  const newMenusResult = await getNewShopMenus(shopId, 5);
  const newMenus = newMenusResult.success && newMenusResult.data ? newMenusResult.data : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Shop Header Section */}
        <ShopHeader shop={shop} />

        {/* New Menu Section */}
        {shop.showNewMenuSection && newMenus.length > 0 && (
           <NewMenuSection menus={newMenus} />
        )}
        
        {shop.showNewMenuSection && newMenus.length > 0 && <div className="h-px bg-gray-200 my-8" />}

        {/* All Menu Grid with Filters */}
        <MenuGrid menus={allMenus} />
        
      </main>
    </div>
  );
}