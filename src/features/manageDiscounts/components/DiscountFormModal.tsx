'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ActionResult,
  CreateDiscountInput,
  SerializableDiscount,
  SerializableDiscountMeal,
  createDiscount,
  updateDiscount,
} from '../action';
import { WEEK_DAYS, EVERY_DAY } from '@/features/discounts/activeDays';

interface DiscountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: SerializableDiscount;
  shopMeals: SerializableDiscountMeal[];
  onSuccess: () => void;
}

export default function DiscountFormModal({
  isOpen,
  onClose,
  initialData,
  shopMeals,
  onSuccess,
}: DiscountFormModalProps) {
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState<number>(0);
  const [minOrderSubtotal, setMinOrderSubtotal] = useState<number>(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [activeDays, setActiveDays] = useState<string[]>(EVERY_DAY);
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([]);
  const [mealSearch, setMealSearch] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setPercentage(initialData.percentage);
        setMinOrderSubtotal(initialData.minOrderSubtotal);
        setMaxDiscountAmount(initialData.maxDiscountAmount);
        setIsActive(initialData.isActive);
        setActiveDays(
          initialData.activeDays.length > 0 ? initialData.activeDays : EVERY_DAY
        );
        setSelectedMealIds(initialData.meals.map((m) => m.id));
      } else {
        setName('');
        setPercentage(0);
        setMinOrderSubtotal(0);
        setMaxDiscountAmount(0);
        setIsActive(true);
        setActiveDays(EVERY_DAY);
        setSelectedMealIds([]);
      }
      setMealSearch('');
      setError(null);
    }
  }, [isOpen, initialData]);

  const filteredMeals = useMemo(() => {
    const q = mealSearch.trim().toLowerCase();
    if (!q) return shopMeals;
    return shopMeals.filter((m) => m.name.toLowerCase().includes(q));
  }, [shopMeals, mealSearch]);

  if (!isOpen) return null;

  const toggleMeal = (id: string) => {
    setSelectedMealIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const allFilteredSelected =
    filteredMeals.length > 0 && filteredMeals.every((m) => selectedMealIds.includes(m.id));

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredMeals.map((m) => m.id);
    if (allFilteredSelected) {
      setSelectedMealIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedMealIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const toggleDay = (day: string) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (percentage <= 0 || percentage > 100) {
      setError('Percentage must be between 0 and 100.');
      return;
    }

    if (activeDays.length === 0) {
      setError('Select at least one active day.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload: CreateDiscountInput = {
      name: name.trim(),
      percentage,
      minOrderSubtotal: minOrderSubtotal || 0,
      maxDiscountAmount: maxDiscountAmount || 0,
      isActive,
      activeDays,
      mealIds: selectedMealIds,
    };

    let result: ActionResult<SerializableDiscount>;
    if (initialData) {
      result = await updateDiscount({ ...payload, id: initialData.id });
    } else {
      result = await createDiscount(payload);
    }

    setIsLoading(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl m-4 p-6 relative max-h-[90vh] overflow-y-auto outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {initialData ? 'Edit Discount' : 'Add New Discount'}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] focus:outline-none border p-2 bg-gray-50/50"
              placeholder="e.g. Lunch Promo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Percentage</label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                required
                value={percentage}
                onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-md border-gray-300 pr-8 focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] focus:outline-none p-2 border bg-gray-50/50"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Min. order subtotal{' '}
                <span className="text-xs text-gray-500">(0 = none)</span>
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">Rp</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={minOrderSubtotal}
                  onChange={(e) => setMinOrderSubtotal(parseFloat(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 pl-9 focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] focus:outline-none p-2 border bg-gray-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max. discount{' '}
                <span className="text-xs text-gray-500">(0 = no cap)</span>
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">Rp</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="block w-full rounded-md border-gray-300 pl-9 focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] focus:outline-none p-2 border bg-gray-50/50"
                />
              </div>
            </div>
          </div>

          {/* Active days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Active days{' '}
                <span className="text-xs text-gray-500">
                  ({activeDays.length === 7 ? 'every day' : `${activeDays.length} selected`})
                </span>
              </label>
              <button
                type="button"
                onClick={() => setActiveDays(EVERY_DAY)}
                className="text-xs font-medium text-[#F97352] hover:underline"
              >
                Every day
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => {
                const selected = activeDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    aria-pressed={selected}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                      selected
                        ? 'bg-[#F97352] text-white shadow-md shadow-orange-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              The discount only applies on the selected days.
            </p>
          </div>

          {/* Attach to menus */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Apply to menus{' '}
                <span className="text-xs text-gray-500">({selectedMealIds.length} selected)</span>
              </label>
              {filteredMeals.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAllFiltered}
                  className="text-xs font-medium text-[#F97352] hover:underline"
                >
                  {allFilteredSelected ? 'Clear' : 'Select all'}
                </button>
              )}
            </div>

            {shopMeals.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-200">
                No menus yet. Add menu items first to attach this discount.
              </p>
            ) : (
              <>
                <input
                  type="text"
                  value={mealSearch}
                  onChange={(e) => setMealSearch(e.target.value)}
                  placeholder="Search menus..."
                  className="mb-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] focus:outline-none border p-2 bg-gray-50/50 text-sm"
                />
                <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                  {filteredMeals.length === 0 ? (
                    <p className="text-sm text-gray-500 p-3">No menus match your search.</p>
                  ) : (
                    filteredMeals.map((meal) => (
                      <label
                        key={meal.id}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMealIds.includes(meal.id)}
                          onChange={() => toggleMeal(meal.id)}
                          className="h-4 w-4 text-[#F97352] focus:ring-[#F97352] border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{meal.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-[#F97352] focus:ring-[#F97352] border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active
            </label>
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
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F97352] hover:bg-[#e06241] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97352] disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving...' : initialData ? 'Update Discount' : 'Add Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
