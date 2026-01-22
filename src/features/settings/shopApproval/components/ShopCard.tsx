'use client';

import React, { useState } from 'react';
import { Shop, ShopStatus, User, UserShopRole } from '@prisma/client';
import { updateShopStatus } from '../action';
import toast from 'react-hot-toast';
import { showConfirmationToast } from '@/components/ConfirmationToast';

type ShopWithUser = Shop & {
  userRoles: (UserShopRole & { user: User })[];
};

interface ShopCardProps {
  shop: ShopWithUser;
  onStatusChange: () => void;
}

export function ShopCard({ shop, onStatusChange }: ShopCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const owner = shop.userRoles[0]?.user;

  const handleStatusUpdate = (newStatus: ShopStatus) => {
    showConfirmationToast(
        `Are you sure you want to change status to ${newStatus}?`,
        async () => {
            setIsLoading(true);
            try {
                const result = await updateShopStatus(shop.id, newStatus);
                if (result.success) {
                    onStatusChange();
                    toast.success(`Shop status updated to ${newStatus}`);
                } else {
                    toast.error('Failed to update status');
                }
            } catch (err) {
                console.error(err);
                toast.error('An error occurred');
            } finally {
                setIsLoading(false);
            }
        }
    )
  };

  const renderActions = () => {
    switch (shop.status) {
      case 'PENDING':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusUpdate('OPEN')}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
              ACCEPT
            </button>
            <button
              onClick={() => handleStatusUpdate('REJECTED')}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
            >
              REJECT
            </button>
          </div>
        );
      case 'REJECTED':
      case 'SUSPENDED':
        return (
          <button
            onClick={() => handleStatusUpdate('OPEN')}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            ACTIVATE
          </button>
        );
      case 'OPEN':
      case 'CLOSED':
        return (
          <button
            onClick={() => handleStatusUpdate('SUSPENDED')}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm font-medium"
          >
            SUSPEND
          </button>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: ShopStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'SUSPENDED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
             {shop.profileImage && (
                <img 
                    src={shop.profileImage} 
                    alt={shop.name} 
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
             )}
             <div>
                <h3 className="text-lg font-medium text-gray-900">{shop.name}</h3>
                <div className="flex gap-2 mt-1">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(shop.status)}`}>
                    {shop.status}
                    </span>
                </div>
             </div>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600 mt-4">
            <p><span className="font-semibold">Owner:</span> {owner ? `${owner.name} (${owner.email})` : 'Unknown'}</p>
            <p><span className="font-semibold">Address:</span> {shop.address}</p>
            <p><span className="font-semibold">Phone:</span> {shop.phone}</p>
            <p><span className="font-semibold">Description:</span> {shop.description}</p>
          </div>
        </div>
        <div className="ml-4">
          {renderActions()}
        </div>
      </div>
    </div>
  );
}
