import { notFound } from 'next/navigation';
import { getShopDetails, getShopMenus, getNewShopMenus } from '@/features/shop/actions';
import { ShopHeader } from '@/features/shop/components/ShopHeader';
import { NewMenuSection } from '@/features/shop/components/NewMenuSection';
import { MenuGrid } from '@/features/shop/components/MenuGrid';
import { Reveal } from '@/components/Reveal';

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

  const showNewMenu = shop.showNewMenuSection && newMenus.length > 0;

  return (
    <div className="flex flex-1 flex-col pb-20">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Shop Header Section */}
        <Reveal y={16}>
          <ShopHeader shop={shop} />
        </Reveal>

        {/* New Menu Section */}
        {showNewMenu && (
          <Reveal y={20} delay={0.05}>
            <NewMenuSection menus={newMenus} />
          </Reveal>
        )}

        {/* All Menu Grid with Filters */}
        <Reveal y={20} delay={showNewMenu ? 0.1 : 0.05}>
          <MenuGrid menus={allMenus} />
        </Reveal>
      </main>
    </div>
  );
}
