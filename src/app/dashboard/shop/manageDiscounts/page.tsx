import { getDiscounts, getShopMealsForSelect } from '@/features/manageDiscounts/action';
import DiscountDashboard from '@/features/manageDiscounts/components/DiscountDashboard';

export const dynamic = 'force-dynamic';

export default async function ManageDiscountsPage() {
  const [discountsResult, mealsResult] = await Promise.all([
    getDiscounts(),
    getShopMealsForSelect(),
  ]);

  if (discountsResult.error) {
    throw new Error(discountsResult.error);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Discounts</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create order-level discounts and attach them to your menus.
            </p>
          </div>
        </div>

        <DiscountDashboard
          initialDiscounts={discountsResult.data || []}
          shopMeals={mealsResult.data || []}
        />
      </div>
    </div>
  );
}
