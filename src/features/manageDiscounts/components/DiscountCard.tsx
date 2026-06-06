'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  SerializableDiscount,
  deleteDiscount,
  toggleDiscountActive,
} from '../action';

interface DiscountCardProps {
  discount: SerializableDiscount;
  onEdit: (discount: SerializableDiscount) => void;
  onChange: (discount: SerializableDiscount) => void;
  onDelete: () => void;
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

export default function DiscountCard({
  discount,
  onEdit,
  onChange,
  onDelete,
}: DiscountCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    const result = await toggleDiscountActive(discount.id);
    setIsToggling(false);
    if (result.success && result.data) {
      onChange(result.data);
    } else {
      toast.error(result.error || 'Failed to toggle discount');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete discount "${discount.name}"? This cannot be undone.`)) return;
    setIsDeleting(true);
    const result = await deleteDiscount(discount.id);
    setIsDeleting(false);
    if (result.success) {
      toast.success('Discount deleted');
      onDelete();
    } else {
      toast.error(result.error || 'Failed to delete discount');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{discount.name}</h3>
            <p className="mt-0.5 text-2xl font-extrabold text-orange-600">
              {discount.percentage}% off
            </p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              discount.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {discount.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <dl className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Min. order subtotal</dt>
            <dd className="font-medium text-gray-900">
              {discount.minOrderSubtotal > 0 ? formatRupiah(discount.minOrderSubtotal) : '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Max. discount</dt>
            <dd className="font-medium text-gray-900">
              {discount.maxDiscountAmount > 0 ? formatRupiah(discount.maxDiscountAmount) : 'No cap'}
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 mb-1.5">
            Applies to {discount.meals.length} menu{discount.meals.length === 1 ? '' : 's'}
          </p>
          {discount.meals.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {discount.meals.slice(0, 4).map((meal) => (
                <span
                  key={meal.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-xs"
                >
                  {meal.name}
                </span>
              ))}
              {discount.meals.length > 4 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs">
                  +{discount.meals.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex border-t border-gray-100 divide-x divide-gray-100">
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {discount.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={() => onEdit(discount)}
          className="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {isDeleting ? '...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
