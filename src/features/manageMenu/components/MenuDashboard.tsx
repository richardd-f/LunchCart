'use client';

import { useState, useEffect, useMemo } from 'react';
import { MealCategory } from '@prisma/client';
import { getMeals, MealWithRelations, updateMealOrder } from '../action';
import MenuCard from './MenuCard';
import MenuFormModal from './MenuFormModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import toast from 'react-hot-toast';

interface MenuDashboardProps {
  initialMeals: MealWithRelations[];
}

export default function MenuDashboard({ initialMeals }: MenuDashboardProps) {
  const [meals, setMeals] = useState<MealWithRelations[]>(initialMeals);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MealCategory | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealWithRelations | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

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

  // Category filter tabs
  const categories: (MealCategory | 'ALL')[] = ['ALL', 'MEAL', 'SNACK', 'DRINK', 'DESSERT', 'TOOL', 'SAUCE'];

  // Filter meals based on selected category
  const filteredMeals = useMemo(() => {
    let result = meals;
    if (selectedCategory !== 'ALL') {
      result = meals.filter(meal => meal.category === selectedCategory);
    }
    // Sort by orderNumber to maintain visual order
    return [...result].sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));
  }, [meals, selectedCategory]);

  // Use the filtered meals IDs for SortableContext
  const items = useMemo(() => filteredMeals.map(m => m.id), [filteredMeals]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = filteredMeals.findIndex((meal) => meal.id === active.id);
    const newIndex = filteredMeals.findIndex((meal) => meal.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the filtered meals array
    const reorderedFiltered = arrayMove(filteredMeals, oldIndex, newIndex);
    
    // Update orderNumber for the reordered meals
    const updatedFilteredMeals = reorderedFiltered.map((meal, index) => ({
      ...meal,
      orderNumber: index
    }));

    // Create a map for quick lookup
    const filteredMealsMap = new Map(updatedFilteredMeals.map(meal => [meal.id, meal]));

    // Update the full meals array - replace filtered items with updated versions
    const updatedMeals = meals.map(meal => {
      if (filteredMealsMap.has(meal.id)) {
        return filteredMealsMap.get(meal.id)!;
      }
      return meal;
    });

    // Force immediate UI update
    setMeals(updatedMeals);

    // Save to server
    setIsSavingOrder(true);
    try {
      const mealOrders = updatedFilteredMeals.map((meal) => ({
        id: meal.id,
        orderNumber: meal.orderNumber,
      }));

      const result = await updateMealOrder(mealOrders);
      
      if (!result.success) {
        toast.error(result.error || 'Failed to update order');
        // Revert on error
        fetchMeals(search);
      } else {
        toast.success('Menu order updated');
      }
    } catch (error) {
      console.error('Error updating meal order:', error);
      toast.error('Failed to update order');
      fetchMeals(search);
    } finally {
      setIsSavingOrder(false);
    }
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

      {/* Category Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
              ${selectedCategory === cat 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
            `}
          >
            {cat === 'ALL' ? 'All Items' : cat.charAt(0) + cat.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Saving indicator */}
      {isSavingOrder && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-blue-700 font-medium">Saving order...</span>
        </div>
      )}

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMeals.map((meal) => (
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
          </SortableContext>
        </DndContext>
      )}
      
      <MenuFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingMeal}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
