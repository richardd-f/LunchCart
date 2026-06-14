"use client"

import React, { useState, useMemo } from 'react'
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
    { value: "Ready", label: "Ready for Pickup" },
    { value: "Completed", label: "Completed" },
]

export default function FilterSection({ filters, onFiltersChange, meals, isLoadingMeals }: FilterSectionProps) {
    const [showMealDropdown, setShowMealDropdown] = useState(false)
    const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set())

    const handleDateChange = (value: string) => {
        onFiltersChange({ ...filters, pickupDate: value || undefined })
    }

    const handleClearDate = () => {
        onFiltersChange({ ...filters, pickupDate: undefined })
    }

    const handleStatusChange = (value: string) => {
        onFiltersChange({ ...filters, statusFilter: value === "All" ? undefined : value })
    }

    const handleMealToggle = (mealId: string) => {
        const currentMealIds = filters.mealIds || []
        let newMealIds: string[]
        
        if (currentMealIds.includes(mealId)) {
            newMealIds = currentMealIds.filter(id => id !== mealId)
            // Also remove options associated with this meal
            const meal = meals.find(m => m.id === mealId)
            const mealOptionNames = meal?.optionGroups.flatMap(g => g.values.map(v => v.name)) || []
            const newOptionNames = (filters.optionNames || []).filter(name => !mealOptionNames.includes(name))
            onFiltersChange({
                ...filters,
                mealIds: newMealIds.length > 0 ? newMealIds : undefined,
                optionNames: newOptionNames.length > 0 ? newOptionNames : undefined,
            })
            return
        } else {
            newMealIds = [...currentMealIds, mealId]
        }
        
        onFiltersChange({
            ...filters,
            mealIds: newMealIds.length > 0 ? newMealIds : undefined,
        })
    }

    const handleOptionToggle = (optionName: string, mealId: string) => {
        const currentOptions = filters.optionNames || []
        let newOptions: string[]
        
        if (currentOptions.includes(optionName)) {
            newOptions = currentOptions.filter(name => name !== optionName)
        } else {
            newOptions = [...currentOptions, optionName]
        }
        
        // Auto-select parent meal if not already selected
        const currentMealIds = filters.mealIds || []
        let newMealIds = currentMealIds
        if (!currentMealIds.includes(mealId)) {
            newMealIds = [...currentMealIds, mealId]
        }

        onFiltersChange({
            ...filters,
            mealIds: newMealIds.length > 0 ? newMealIds : undefined,
            optionNames: newOptions.length > 0 ? newOptions : undefined,
        })
    }

    const toggleMealExpanded = (mealId: string) => {
        const newExpanded = new Set(expandedMeals)
        if (newExpanded.has(mealId)) {
            newExpanded.delete(mealId)
        } else {
            newExpanded.add(mealId)
        }
        setExpandedMeals(newExpanded)
    }

    const handleClearFilters = () => {
        onFiltersChange({})
    }

    const hasActiveFilters = filters.pickupDate || (filters.mealIds && filters.mealIds.length > 0) || filters.statusFilter || (filters.optionNames && filters.optionNames.length > 0)

    const selectedMealCount = filters.mealIds?.length || 0
    const selectedOptionCount = filters.optionNames?.length || 0
    const totalSelectedCount = selectedMealCount + selectedOptionCount

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select
                        value={filters.statusFilter || "All"}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Pickup Date Filter with Clear Button */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pickup Date</label>
                    <div className="flex gap-1">
                        <input
                            type="date"
                            value={filters.pickupDate || ""}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all"
                        />
                        {filters.pickupDate && (
                            <button
                                type="button"
                                onClick={handleClearDate}
                                className="px-2 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                                title="Clear date filter"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Multi-Select Menu Item Filter with Nested Options */}
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Menu Items & Options</label>
                    <button
                        type="button"
                        onClick={() => setShowMealDropdown(!showMealDropdown)}
                        disabled={isLoadingMeals}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-left focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all disabled:bg-gray-100 flex justify-between items-center"
                    >
                        <span className={totalSelectedCount > 0 ? "text-gray-900" : "text-gray-500"}>
                            {totalSelectedCount > 0 ? `${totalSelectedCount} selected` : "All Items"}
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                    
                    {showMealDropdown && (
                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                            {meals.map(meal => {
                                const hasOptions = meal.optionGroups.some(g => g.values.length > 0)
                                const isExpanded = expandedMeals.has(meal.id)
                                const isMealChecked = filters.mealIds?.includes(meal.id) || false
                                
                                return (
                                    <div key={meal.id} className="border-b border-gray-100 last:border-b-0">
                                        {/* Meal Row */}
                                        <div className="flex items-center px-3 py-2 hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={isMealChecked}
                                                onChange={() => handleMealToggle(meal.id)}
                                                className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 flex-1">{meal.name}</span>
                                            
                                            {hasOptions && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        toggleMealExpanded(meal.id)
                                                    }}
                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                >
                                                    <svg 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        fill="none" 
                                                        viewBox="0 0 24 24" 
                                                        strokeWidth={1.5} 
                                                        stroke="currentColor" 
                                                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Options (Nested) */}
                                        {isExpanded && hasOptions && (
                                            <div className="bg-gray-50 pl-10 pr-3 py-2">
                                                {meal.optionGroups.map(group => (
                                                    <div key={group.id} className="mb-2 last:mb-0">
                                                        <div className="text-sm font-medium text-gray-500 py-1">{group.name}</div>
                                                        {group.values.map(opt => (
                                                            <label 
                                                                key={opt.id} 
                                                                className="flex items-center py-1.5 px-2 hover:bg-gray-100 rounded cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={filters.optionNames?.includes(opt.name) || false}
                                                                    onChange={() => handleOptionToggle(opt.name, meal.id)}
                                                                    className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
                                                                />
                                                                <span className="ml-2 text-sm text-gray-700">{opt.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                            {meals.length === 0 && (
                                <div className="px-3 py-2 text-sm text-gray-500">No meals available</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Click outside to close dropdown */}
            {showMealDropdown && (
                <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMealDropdown(false)}
                />
            )}
        </div>
    )
}
