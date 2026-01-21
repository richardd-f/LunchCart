import { getShopProfile } from '@/features/settings/shop/action';
import ShopProfileForm from '@/features/settings/shop/components/ShopProfileForm';
import ShopRequestFlow from '@/features/settings/shop/components/ShopRequestFlow';
import { Suspense } from 'react';

export default async function ShopProfilePage() {
  const shop = await getShopProfile();

  if (!shop) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <ShopRequestFlow />
      </Suspense>
    );
  }

  if (shop.status === 'PENDING') {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-yellow-800">
               Request Under Review
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                We have received your request to open <strong>{shop.name}</strong>. Your shop is currently under review. 
                We will notify you once your application has been processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (shop.status === 'SUSPENDED') {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">
               Shop Suspended
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Your shop <strong>{shop.name}</strong> is currently suspended. 
                Please contact the administrator for more information.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Suspense fallback={<div>Loading shop details...</div>}>
         <ShopProfileForm initialData={shop} />
      </Suspense>
    </div>
  );
}
