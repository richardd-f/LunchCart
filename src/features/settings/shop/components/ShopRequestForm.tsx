'use client';

import { useActionState, useState } from 'react';
import { createShop } from '../action';
import UploadButton from '@/components/UploadButton';
import Image from 'next/image';

export default function ShopRequestForm() {
  const [state, action, isPending] = useActionState(createShop, {});
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageUpload = (results: any[]) => {
    if (results && results.length > 0 && results[0].secure_url) {
      setImageUrl(results[0].secure_url);
    }
  };

  return (
    <form action={action} className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Open a Shop
        </h3>
        <div className="mt-2 text-sm text-gray-500">
          <p>Fill in the details below to request to open a new shop.</p>
        </div>

        {state.error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {state.error}
          </div>
        )}
        
        {state.message && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
            {state.message}
          </div>
        )}

        <input type="hidden" name="profileImage" value={imageUrl || ''} />

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          
          {/* Profile Image Section */}
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">
              Shop Logo / Image
            </label>
            <div className="mt-2 flex items-center space-x-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Shop Request"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-gray-400">
                    <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
              </div>
              <UploadButton 
                options={{ maxFiles: 1, multiple: false }}
                onConfirmed={handleImageUpload} 
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Shop Name *
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address *
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="address"
                id="address"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone *
            </label>
            <div className="mt-1">
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Brief description of your shop.
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 sm:rounded-b-lg">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#F97352] hover:bg-[#e06646] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97352] disabled:opacity-50"
        >
          {isPending ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}
