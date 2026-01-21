'use client';

import { useState, useEffect, useCallback } from 'react';
import { Meal, MealOptionGroup, MealOptionValue, MealImage } from '@/generated/prisma/client';
import { getMeals, MealWithRelations } from '../action';
import MenuCard from './MenuCard';
import MenuFormModal from './MenuFormModal';
import { OptionGroupInput } from '../action'; // Helper type if needed, but we use the Prisma types mostly here

interface MenuDashboardProps {
  initialMeals: MealWithRelations[];
}

export default function MenuDashboard({ initialMeals }: MenuDashboardProps) {
  const [meals, setMeals] = useState<MealWithRelations[]>(initialMeals);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealWithRelations | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchMeals(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchMeals = async (searchTerm: string) => {
    setIsLoading(true);
    const result = await getMeals(searchTerm);
    if (result.success && result.data) {
      setMeals(result.data);
    }
    setIsLoading(false);
  };

  const handleCreate = () => {
    setEditingMeal(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (meal: MealWithRelations) => {
    setEditingMeal(meal);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    fetchMeals(search);
    setIsModalOpen(false);
  };

  const handleCardDelete = () => {
      // Refresh list after delete
      fetchMeals(search);
  };

  const handleCardToggle = (updatedMeal: MealWithRelations) => {
      setMeals(prevMeals => prevMeals.map(meal => 
          meal.id === updatedMeal.id ? updatedMeal : meal
      ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition duration-150 ease-in-out"
          />
        </div>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      {isLoading && meals.length === 0 ? (
         <div className="text-center py-12">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-orange-500 rounded-full" role="status"></div>
            <p className="mt-2 text-gray-500">Loading menu...</p>
         </div>
      ) : meals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No menu items</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new menu item.</p>
          <button
            onClick={handleCreate}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Add Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {meals.map((meal) => (
            <div key={meal.id} className="h-full">
                <MenuCard 
                    meal={meal} 
                    onEdit={handleEdit}
                    onDelete={handleCardDelete}
                    onToggle={handleCardToggle}
                />
             </div>
          ))}
        </div>
      )}

      {/* Since I noticed MenuCard doesn't have a callback for delete success, I'll update MenuCard Props in the next step or now if I can.
          For now, I'll assume I update MenuCard.tsx to accept `onDeleteSuccess`.
      */}
      
      <MenuFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingMeal}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
