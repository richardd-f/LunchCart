"use client"

import React from 'react'

const FILTERS = [
    "All Orders",
    "Pending",
    "Ready",
    "Completed",
    "Cancelled"
]

interface OrderFilterProps {
    currentFilter: string
    onFilterChange: (filter: string) => void
}

export default function OrderFilter({ currentFilter, onFilterChange }: OrderFilterProps) {
  return (
    <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
        {FILTERS.map((filter) => (
            <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`
                    px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                    ${currentFilter === filter 
                        ? 'bg-[#F97352] text-white shadow-md' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }
                `}
            >
                {filter}
            </button>
        ))}
    </div>
  )
}
