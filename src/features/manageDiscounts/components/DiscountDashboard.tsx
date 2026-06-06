'use client';

import { useState } from 'react';
import {
  SerializableDiscount,
  SerializableDiscountMeal,
  getDiscounts,
} from '../action';
import DiscountCard from './DiscountCard';
import DiscountFormModal from './DiscountFormModal';

interface DiscountDashboardProps {
  initialDiscounts: SerializableDiscount[];
  shopMeals: SerializableDiscountMeal[];
}

export default function DiscountDashboard({
  initialDiscounts,
  shopMeals,
}: DiscountDashboardProps) {
  const [discounts, setDiscounts] = useState<SerializableDiscount[]>(initialDiscounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<SerializableDiscount | undefined>(
    undefined
  );

  const refresh = async () => {
    const result = await getDiscounts();
    if (result.success && result.data) {
      setDiscounts(result.data);
    }
  };

  const handleCreate = () => {
    setEditingDiscount(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (discount: SerializableDiscount) => {
    setEditingDiscount(discount);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    refresh();
    setIsModalOpen(false);
  };

  const handleCardChange = (updated: SerializableDiscount) => {
    setDiscounts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const handleCardDelete = () => {
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500">
          {discounts.length} discount{discounts.length === 1 ? '' : 's'} configured
        </p>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Discount
        </button>
      </div>

      {discounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No discounts yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first discount.
          </p>
          <button
            onClick={handleCreate}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Add Discount
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => (
            <DiscountCard
              key={discount.id}
              discount={discount}
              onEdit={handleEdit}
              onChange={handleCardChange}
              onDelete={handleCardDelete}
            />
          ))}
        </div>
      )}

      <DiscountFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingDiscount}
        shopMeals={shopMeals}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
