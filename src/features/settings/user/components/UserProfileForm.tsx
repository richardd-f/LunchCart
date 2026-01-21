'use client';

import { useActionState } from 'react';
import { updateUserProfile } from '../action';

interface UserProfileFormProps {
  initialData: {
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export default function UserProfileForm({ initialData }: UserProfileFormProps) {
  const [state, action, isPending] = useActionState(updateUserProfile, {});

  if (!initialData) {
    return <div>Failed to load profile data.</div>;
  }

  return (
    <form action={action} className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          User Profile
        </h3>
        <div className="mt-2 text-sm text-gray-500">
          <p>Update your personal information.</p>
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

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={initialData.name}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                name="email"
                id="email"
                defaultValue={initialData.email || ''}
                disabled
                className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 shadow-sm sm:text-sm p-2 border cursor-not-allowed"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <div className="mt-1">
              <input
                type="tel"
                name="phone"
                id="phone"
                defaultValue={initialData.phone || ''}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 sm:rounded-b-lg">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#F97352] hover:bg-[#e06646] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97352] disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
