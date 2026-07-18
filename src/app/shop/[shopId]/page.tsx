import { notFound } from 'next/navigation';
import { getShopDetails, getShopMenusPage, getNewShopMenus } from '@/features/shop/actions';
import { MENU_PAGE_SIZE } from '@/features/shop/pagination';
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

  // 2. Fetch the first page of menus (the grid lazy-loads the rest on scroll)
  const menuPageResult = await getShopMenusPage(shopId, { take: MENU_PAGE_SIZE });
  const initialMenus =
    menuPageResult.success && menuPageResult.data ? menuPageResult.data.menus : [];
  const initialHasMore =
    menuPageResult.success && menuPageResult.data ? menuPageResult.data.hasMore : false;

  // 3. Fetch New Menus (e.g., limit 5)
  const newMenusResult = await getNewShopMenus(shopId, 5);
  const newMenus = newMenusResult.success && newMenusResult.data ? newMenusResult.data : [];

  const showNewMenu = shop.showNewMenuSection && newMenus.length > 0;

  return (
    <div className="flex flex-1 flex-col pb-20">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Shop Header Section */}
        <ShopHeader shop={shop} />

        {/* New Menu Section */}
        {showNewMenu && <NewMenuSection menus={newMenus} />}

        {/* All Menu Grid with Filters */}
        <MenuGrid
          shopId={shopId}
          initialMenus={initialMenus}
          initialHasMore={initialHasMore}
        />
      </main>
    </div>
  );
}
