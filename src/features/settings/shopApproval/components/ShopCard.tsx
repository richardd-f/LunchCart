'use client';

import React, { useState } from 'react';
import { Shop, ShopStatus, User, UserShopRole } from '@prisma/client';
import { updateShopStatus, deleteShop } from '../action';
import { toast } from 'react-toastify';
import { showConfirmationToast } from '@/components/ConfirmationToast';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

type ShopWithUser = Shop & {
  userRoles: (UserShopRole & { user: User })[];
};

interface ShopCardProps {
  shop: ShopWithUser;
  onStatusChange: () => void;
}

export function ShopCard({ shop, onStatusChange }: ShopCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

  const handleDelete = async () => {
    setIsDeleteModalOpen(false); // Close modal first
    setIsLoading(true);
    
    try {
        const result = await deleteShop(shop.id);
        if (result.success) {
            onStatusChange();
            toast.success('Shop deleted successfully');
        } else {
            toast.error(result.error || 'Failed to delete shop');
        }
    } catch (err) {
        console.error(err);
        toast.error('An error occurred');
    } finally {
        setIsLoading(false);
    }
  };

  const renderActions = () => {
    switch (shop.status) {
      case 'PENDING':
        return (
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handleStatusUpdate('OPEN')}
              disabled={isLoading}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-xs font-bold"
            >
              ACCEPT
            </button>
            <button
              onClick={() => handleStatusUpdate('REJECTED')}
              disabled={isLoading}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-xs font-bold"
            >
              REJECT
            </button>
            {renderDeleteButton()}
          </div>
        );
      case 'REJECTED':
      case 'SUSPENDED':
        return (
          <div className="flex gap-2 items-center">
            <button
                onClick={() => handleStatusUpdate('OPEN')}
                disabled={isLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-xs font-bold"
            >
                ACTIVATE
            </button>
            {renderDeleteButton()}
          </div>
        );
      case 'OPEN':
      case 'CLOSED':
        return (
          <div className="flex gap-2 items-center">
            <button
                onClick={() => handleStatusUpdate('SUSPENDED')}
                disabled={isLoading}
                className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-xs font-bold"
            >
                SUSPEND
            </button>
            {renderDeleteButton()}
          </div>
        );
      default:
        return null;
    }
  };

  const renderDeleteButton = () => (
    <button
        onClick={() => setIsDeleteModalOpen(true)}
        disabled={isLoading}
        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
        title="Delete Shop"
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
    </button>
  );

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
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-start sm:items-center gap-3 mb-2">
             {shop.profileImage && (
                <img 
                    src={shop.profileImage} 
                    alt={shop.name} 
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                />
             )}
             <div className="min-w-0">
                <h3 className="text-lg font-medium text-gray-900 break-words">{shop.name}</h3>
                <div className="flex gap-2 mt-1">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(shop.status)}`}>
                    {shop.status}
                    </span>
                </div>
             </div>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600 mt-4 break-words">
            <p><span className="font-semibold">Owner:</span> {owner ? `${owner.name} (${owner.email})` : 'Unknown'}</p>
            <p><span className="font-semibold">Address:</span> {shop.address}</p>
            <p><span className="font-semibold">Phone:</span> {shop.phone}</p>
            <p><span className="font-semibold">Description:</span> {shop.description}</p>
          </div>
        </div>
        <div className="w-full md:w-auto flex justify-end md:ml-4">
          {renderActions()}
        </div>
      </div>

      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        shopName={shop.name}
      />
    </div>
  );
}
