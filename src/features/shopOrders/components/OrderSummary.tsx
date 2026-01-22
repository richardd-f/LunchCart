"use client"

import React from 'react'
import { OrderAggregation } from '../action'

interface OrderSummaryProps {
    aggregations: OrderAggregation[]
    isLoading?: boolean
    selectedDate?: string
}

export default function OrderSummary({ aggregations, isLoading, selectedDate }: OrderSummaryProps) {
    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                <div className="animate-pulse space-y-3">
                    <div className="h-5 bg-orange-200 rounded w-1/3"></div>
                    <div className="h-4 bg-orange-100 rounded w-full"></div>
                    <div className="h-4 bg-orange-100 rounded w-2/3"></div>
                </div>
            </div>
        )
    }

    if (aggregations.length === 0) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">No orders to prepare for {selectedDate || "this day"}.</p>
            </div>
        )
    }

    const totalItems = aggregations.reduce((sum, agg) => sum + agg.totalQuantity, 0)

    return (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                    Order Summary
                </h3>
                <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                    {totalItems} items total
                </span>
            </div>

            <div className="space-y-4">
                {aggregations.map((agg) => (
                    <div key={agg.mealId || agg.mealName} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-800">{agg.mealName}</span>
                            <span className="text-sm font-bold text-[#F97352]">{agg.totalQuantity} pcs</span>
                        </div>
                        
                        {agg.breakdown.length > 0 && (
                            <div className="border-t border-gray-100 pt-2 mt-2">
                                <p className="text-xs text-gray-500 mb-1">Details:</p>
                                <ul className="space-y-1">
                                    {agg.breakdown.map((item, idx) => (
                                        <li key={idx} className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600">• {item.key}</span>
                                            <span className="font-medium text-gray-700">{item.quantity} pcs</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
