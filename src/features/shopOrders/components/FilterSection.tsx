"use client"

import React from 'react'
import { ShopOrderFilters, getShopMeals } from '../action'

type Meal = Awaited<ReturnType<typeof getShopMeals>>[number]

interface FilterSectionProps {
    filters: ShopOrderFilters
    onFiltersChange: (filters: ShopOrderFilters) => void
    meals: Meal[]
    isLoadingMeals?: boolean
}

const STATUS_OPTIONS = [
    { value: "All", label: "All Statuses" },
    { value: "Pending", label: "Pending" },
    { value: "Confirmed", label: "Confirmed (Cooking)" },
    { value: "Ready", label: "Ready for Pickup" },
    { value: "Completed", label: "Completed" },
]

export default function FilterSection({ filters, onFiltersChange, meals, isLoadingMeals }: FilterSectionProps) {
    const selectedMeal = meals.find(m => m.id === filters.mealId)
    const availableOptions = selectedMeal?.optionGroups.flatMap(g => g.values) || []

    const handleChange = (key: keyof ShopOrderFilters, value: string | undefined) => {
        const newFilters = { ...filters, [key]: value || undefined }
        
        // Clear option filter if meal changes
        if (key === 'mealId') {
            newFilters.optionName = undefined
        }
        
        onFiltersChange(newFilters)
    }

    const handleClearFilters = () => {
        onFiltersChange({})
    }

    const hasActiveFilters = filters.pickupDate || filters.mealId || filters.statusFilter

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                    </svg>
                    Filters
                </h3>
                {hasActiveFilters && (
                    <button 
                        onClick={handleClearFilters}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                        Clear all
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select
                        value={filters.statusFilter || "All"}
                        onChange={(e) => handleChange('statusFilter', e.target.value === "All" ? undefined : e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Pickup Date Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pickup Date</label>
                    <input
                        type="date"
                        value={filters.pickupDate || ""}
                        onChange={(e) => handleChange('pickupDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                    />
                </div>

                {/* Meal Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Menu Item</label>
                    <select
                        value={filters.mealId || ""}
                        onChange={(e) => handleChange('mealId', e.target.value)}
                        disabled={isLoadingMeals}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all disabled:bg-gray-100"
                    >
                        <option value="">All Menu Items</option>
                        {meals.map(meal => (
                            <option key={meal.id} value={meal.id}>{meal.name}</option>
                        ))}
                    </select>
                </div>

                {/* Option Filter (Only visible when meal is selected) */}
                {filters.mealId && availableOptions.length > 0 && (
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Option</label>
                        <select
                            value={filters.optionName || ""}
                            onChange={(e) => handleChange('optionName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                        >
                            <option value="">All Options</option>
                            {availableOptions.map(opt => (
                                <option key={opt.id} value={opt.name}>{opt.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    )
}
