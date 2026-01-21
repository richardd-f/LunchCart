'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Shop, ShopStatus, User, UserShopRole } from '@/generated/prisma/client';
import { getShops } from '../action';
import { ShopCard } from './ShopCard';

type ShopWithUser = Shop & {
  userRoles: (UserShopRole & { user: User })[];
};

type FilterType = 'PENDING' | 'REJECTED' | 'ACTIVE' | 'SUSPENDED' | 'ALL';

export function ShopApprovalPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('PENDING');
  const [shops, setShops] = useState<ShopWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    let statusFilter: ShopStatus[] | undefined;

    switch (activeFilter) {
      case 'PENDING':
        statusFilter = ['PENDING'];
        break;
      case 'REJECTED':
        statusFilter = ['REJECTED'];
        break;
      case 'ACTIVE':
        statusFilter = ['OPEN', 'CLOSED'];
        break;
      case 'SUSPENDED':
        statusFilter = ['SUSPENDED'];
        break;
      case 'ALL':
      default:
        statusFilter = undefined;
    }

    const res = await getShops(statusFilter);
    if (res.success && res.data) {
        // Cast the result to the correct type because Prisma include types can be tricky
        // The server action returns exactly what we need
        setShops(res.data as unknown as ShopWithUser[]);
    } else {
      console.error(res.error);
    }
    setLoading(false);
  }, [activeFilter]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const tabs: { label: string; value: FilterType }[] = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'All', value: 'ALL' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`
              py-2 px-4 border-b-2 font-medium text-sm focus:outline-none transition-colors
              ${
                activeFilter === tab.value
                  ? 'border-[#F97352] text-[#F97352]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#F97352]"></div>
          <p className="mt-2 text-gray-500">Loading shops...</p>
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No shops found with this status.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {shops.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              onStatusChange={fetchShops}
            />
          ))}
        </div>
      )}
    </div>
  );
}
