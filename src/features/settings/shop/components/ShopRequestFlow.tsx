'use client';

import { useState } from 'react';
import ShopRequestForm from './ShopRequestForm';

export default function ShopRequestFlow() {
  const [hasConsented, setHasConsented] = useState(false);

  if (!hasConsented) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Become a Seller
          </h3>
          <div className="mt-2 text-sm text-gray-500 space-y-4">
            <p>
              You are about to request to become a seller on <strong>LunchCart</strong>.
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800">
                    Important Information
                  </h3>
                  <div className="mt-2 text-sm text-orange-700">
                    <p>
                       By proceeding, you understand that your shop request will be <strong>reviewed by the administrator</strong>. 
                       You will not be able to sell immediately until your request is approved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              onClick={() => setHasConsented(true)}
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#F97352] text-base font-medium text-white hover:bg-[#e06646] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97352] sm:text-sm"
            >
              Yes, I want to be a seller
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ShopRequestForm />;
}
