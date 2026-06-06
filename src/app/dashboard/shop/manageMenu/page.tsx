import { getMeals, getShopDiscountsForSelect } from '@/features/manageMenu/action';
import MenuDashboard from '@/features/manageMenu/components/MenuDashboard';

export const dynamic = 'force-dynamic';

export default async function ManageMenuPage() {
  const [{ data: meals, error }, { data: shopDiscounts }] = await Promise.all([
    getMeals(),
    getShopDiscountsForSelect(),
  ]);

  if (error) {
    throw new Error(error);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Menu</h1>
              <p className="mt-1 text-sm text-gray-500">Create, update, and organize your shop's menu items.</p>
            </div>
        </div>

        <MenuDashboard initialMeals={meals || []} shopDiscounts={shopDiscounts || []} />
      </div>
    </div>
  );
}
