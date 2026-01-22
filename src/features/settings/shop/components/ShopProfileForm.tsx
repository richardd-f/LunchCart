'use client';

import { useActionState, useState, useEffect } from 'react';
import { updateShopProfile } from '../action';
import UploadButton from '@/components/UploadButton';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ShopProfileFormProps {
  initialData: {
    id: string;
    name: string;
    address: string;
    phone: string;
    profileImage: string | null;
    description: string;
    fixedTimePickup: boolean;
    pickupTimes: {
        id: string;
        time: string;
    }[];
  } | null;
}

export default function ShopProfileForm({ initialData }: ShopProfileFormProps) {
  const [state, action, isPending] = useActionState(updateShopProfile, {});
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.profileImage || null);

  // Show toast notifications when state changes
  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
    if (state.message) {
      toast.success(state.message);
    }
  }, [state]);

  if (!initialData) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900">No Shop Found</h3>
        <p className="mt-2 text-sm text-gray-500">
          You do not appear to be the owner of any shop using this account.
        </p>
      </div>
    );
  }

  const handleImageUpload = (results: any[]) => {
    // Assuming the first result is what we want and it has a secure_url
    if (results && results.length > 0 && results[0].secure_url) {
      setImageUrl(results[0].secure_url);
    }
  };

  const [isFixedTime, setIsFixedTime] = useState(initialData.fixedTimePickup);
  const [pickupTimes, setPickupTimes] = useState<string[]>(
    initialData.pickupTimes && initialData.pickupTimes.length > 0 
        ? initialData.pickupTimes.map((pt: any) => pt.time) 
        : ['12:00']
  );

  const addPickupTime = () => {
    setPickupTimes([...pickupTimes, '12:00']);
  };

  const removePickupTime = (index: number) => {
    if (pickupTimes.length > 1) {
      setPickupTimes(pickupTimes.filter((_, i) => i !== index));
    }
  };

  const updatePickupTime = (index: number, value: string) => {
    const newTimes = [...pickupTimes];
    newTimes[index] = value;
    setPickupTimes(newTimes);
  };

  return (
    <form action={action} className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 text-gray-900 font-bold">
          Shop Profile
        </h3>
        <div className="mt-2 text-sm text-gray-500">
          <p>Update your shop's public information.</p>
        </div>



        {/* Hidden Input for Shop ID and Image URL */}
        <input type="hidden" name="shopId" value={initialData.id} />
        <input type="hidden" name="profileImage" value={imageUrl || ''} />

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          
          {/* Profile Image Section */}
          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-gray-700">
              Profile Image
            </label>
            <div className="mt-2 flex items-center space-x-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Shop Profile"
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
              Shop Name
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

          <div className="sm:col-span-6">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="address"
                id="address"
                defaultValue={initialData.address}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
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
                defaultValue={initialData.phone}
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
                defaultValue={initialData.description}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Brief description of your shop.
            </p>
          </div>

          {/* Pickup Time Configuration */}
          <div className="sm:col-span-6 border-t border-gray-200 pt-6 mt-6">
            <h4 className="text-base font-medium text-gray-900 mb-4">Pickup Time Settings</h4>
            
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Pickup Time Mode
              </label>
              <div className="flex items-center">
                <span className={`text-sm mr-3 ${!isFixedTime ? 'font-bold text-[#F97352]' : 'text-gray-500'}`}>Free Time</span>
                <button
                  type="button"
                  onClick={() => setIsFixedTime(!isFixedTime)}
                  className={`${
                    isFixedTime ? 'bg-[#F97352]' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#F97352] focus:ring-offset-2`}
                  role="switch"
                  aria-checked={isFixedTime}
                >
                  <span
                    aria-hidden="true"
                    className={`${
                      isFixedTime ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
                <span className={`text-sm ml-3 ${isFixedTime ? 'font-bold text-[#F97352]' : 'text-gray-500'}`}>Fixed Time</span>
              </div>
            </div>
            <input type="hidden" name="fixedTimePickup" value={isFixedTime.toString()} />

            {isFixedTime && (
              <div className="mt-4 bg-gray-50 p-4 rounded-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Pickup Times (Required at least 1)
                </label>
                
                <div className="space-y-3">
                  {pickupTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updatePickupTime(index, e.target.value)}
                        className="block w-full max-w-[150px] rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
                        required={isFixedTime} 
                      />
                      {pickupTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePickupTime(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={addPickupTime}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97352]"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Time
                  </button>
                </div>
                {/* Hidden inputs to submit pickup times array */}
                {pickupTimes.map((time, index) => (
                  <input key={`hidden-${index}`} type="hidden" name="pickupTimes" value={time} />
                ))}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {isFixedTime 
                ? "Customers can only choose from the specific times you provide." 
                : "Customers can choose any time for pickup."}
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
          {isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
