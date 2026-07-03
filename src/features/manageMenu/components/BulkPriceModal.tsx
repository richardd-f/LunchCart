'use client';

import { useState, useEffect, useMemo } from 'react';
import { MealWithRelations, bulkAdjustMealPrices } from '../action';

interface BulkPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMeals: MealWithRelations[];
  onSuccess: (updated: MealWithRelations[]) => void;
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

export default function BulkPriceModal({
  isOpen,
  onClose,
  selectedMeals,
  onSuccess,
}: BulkPriceModalProps) {
  const [direction, setDirection] = useState<'increase' | 'decrease'>('increase');
  const [amount, setAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDirection('increase');
      setAmount(0);
      setError(null);
    }
  }, [isOpen]);

  const delta = direction === 'decrease' ? -amount : amount;

  // Meals whose price would drop to Rp0 or below — the edit is blocked while any exist.
  const offending = useMemo(
    () => (amount > 0 ? selectedMeals.filter((m) => m.price + delta <= 0) : []),
    [selectedMeals, amount, delta]
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      setError('Enter an amount greater than 0.');
      return;
    }
    if (offending.length > 0) {
      setError('Some prices would drop to Rp0 or below. Lower the amount first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await bulkAdjustMealPrices({
      mealIds: selectedMeals.map((m) => m.id),
      direction,
      amount,
    });

    setIsLoading(false);

    if (result.success && result.data) {
      onSuccess(result.data);
      onClose();
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4 p-6 relative max-h-[90vh] overflow-y-auto outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Bulk Edit Prices</h2>
        <p className="text-sm text-gray-500 mb-6">
          Applies to {selectedMeals.length} selected menu{selectedMeals.length === 1 ? '' : 's'}.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment</label>
            <div className="flex items-center bg-gray-100 p-1 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setDirection('increase')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  direction === 'increase'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Increase
              </button>
              <button
                type="button"
                onClick={() => setDirection('decrease')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  direction === 'decrease'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Decrease
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">Rp</span>
              </div>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Math.round(parseFloat(e.target.value) || 0)))}
                className="block w-full rounded-md border-gray-300 pl-9 focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] focus:outline-none p-2 border bg-gray-50/50"
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
              {selectedMeals.map((meal) => {
                const newPrice = meal.price + delta;
                const invalid = amount > 0 && newPrice <= 0;
                return (
                  <div
                    key={meal.id}
                    className={`flex items-center justify-between gap-3 px-3 py-2 text-sm ${
                      invalid ? 'bg-red-50' : ''
                    }`}
                  >
                    <span className="text-gray-700 truncate">{meal.name}</span>
                    <span className="shrink-0 font-medium">
                      <span className="text-gray-400">{formatRupiah(meal.price)}</span>
                      <span className="mx-1.5 text-gray-400">&rarr;</span>
                      <span className={invalid ? 'text-red-600' : 'text-gray-900'}>
                        {amount > 0 ? formatRupiah(newPrice) : '—'}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
            {offending.length > 0 && (
              <p className="mt-1.5 text-xs text-red-600">
                {offending.length} menu{offending.length === 1 ? '' : 's'} would drop to Rp0 or
                below. Nothing will be changed until this is fixed.
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || amount <= 0 || offending.length > 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F97352] hover:bg-[#e06241] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97352] disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving...' : `Apply to ${selectedMeals.length} menu${selectedMeals.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
