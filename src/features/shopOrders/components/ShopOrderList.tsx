"use client"

import React, { useEffect, useState, useCallback, useTransition } from 'react'
import FilterSection from './FilterSection'
import OrderSummary from './OrderSummary'
import ShopOrderCard from './ShopOrderCard'
import { getShopOrders, getOrderAggregation, getShopMeals, getShopPickupConfig, ShopOrderFilters, OrderAggregation } from '../action'

type OrderWithDetails = Awaited<ReturnType<typeof getShopOrders>>[number]
type Meal = Awaited<ReturnType<typeof getShopMeals>>[number]
type PickupConfig = Awaited<ReturnType<typeof getShopPickupConfig>>

export default function ShopOrderList() {
    const [filters, setFilters] = useState<ShopOrderFilters>({
        // No default date - user can filter by date if they want
    })
    const [orders, setOrders] = useState<OrderWithDetails[]>([])
    const [aggregations, setAggregations] = useState<OrderAggregation[]>([])
    const [meals, setMeals] = useState<Meal[]>([])
    const [pickupConfig, setPickupConfig] = useState<PickupConfig | undefined>(undefined)
    const [isLoading, startTransition] = useTransition()
    const [isLoadingMeals, setIsLoadingMeals] = useState(true)

    // Fetch meals + pickup config for filter dropdowns (once)
    useEffect(() => {
        getShopMeals()
            .then(setMeals)
            .catch(console.error)
            .finally(() => setIsLoadingMeals(false))

        getShopPickupConfig()
            .then(setPickupConfig)
            .catch(console.error)
    }, [])

    // Fetch orders and aggregations when filters change
    const fetchData = useCallback(() => {
        startTransition(async () => {
            try {
                const [ordersData, aggregationsData] = await Promise.all([
                    getShopOrders(filters),
                    getOrderAggregation(filters),
                ])
                setOrders(ordersData as OrderWithDetails[])
                setAggregations(aggregationsData)
            } catch (error) {
                console.error("Failed to fetch shop orders", error)
            }
        })
    }, [filters])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleFiltersChange = (newFilters: ShopOrderFilters) => {
        setFilters(newFilters)
    }

    const showAggregation = !!filters.pickupDate || (filters.mealIds && filters.mealIds.length > 0)
    const hideOrderList = filters.mealIds && filters.mealIds.length > 0

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <FilterSection
                filters={filters}
                onFiltersChange={handleFiltersChange}
                meals={meals}
                isLoadingMeals={isLoadingMeals}
                pickupConfig={pickupConfig}
            />

            {/* Order Summary (Aggregation) - Shown when filtered by date or specific items */}
            {showAggregation && (
                <OrderSummary 
                    aggregations={aggregations} 
                    isLoading={isLoading}
                    selectedDate={filters.pickupDate || "All Time"}
                />
            )}

            {/* Orders List - Hidden if we are in "Item Summary Mode" (filtering by menu items) */}
            {!hideOrderList && (
                isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : orders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map((order) => (
                            <ShopOrderCard 
                                key={order.id} 
                                order={order} 
                                onStatusChange={fetchData} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-gray-900 font-medium">No orders found</h3>
                        <p className="text-gray-500 text-sm mt-1">
                            No orders match your current filters.
                        </p>
                    </div>
                )
            )}
        </div>
    )
}
