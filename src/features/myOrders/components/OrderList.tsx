"use client"

import React, { useEffect, useState, useCallback, useTransition } from 'react'
import Script from 'next/script'
import OrderFilter from './OrderFilter'
import OrderCard from './OrderCard'
import { getMyOrders, createPaymentToken } from '../action'

import toast from 'react-hot-toast'

// Use the actual return type from getMyOrders (with Decimal converted to number)
type OrderWithDetails = Awaited<ReturnType<typeof getMyOrders>>[number]

// Define Midtrans Snap global type if not available
declare global {
    interface Window {
        snap: any;
    }
}

export default function OrderList() {
    const [filter, setFilter] = useState("All Orders")
    const [orders, setOrders] = useState<OrderWithDetails[]>([])
    const [isLoading, startTransition] = useTransition()
    const [snapScriptLoaded, setSnapScriptLoaded] = useState(false)
    const MIDTRANS_SNAP_URL = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' 
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js'
    const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '' 
    
    // Fetch orders when filter changes
    const fetchOrders = useCallback(() => {
        startTransition(async () => {
            try {
                const data = await getMyOrders(filter)
                setOrders(data as OrderWithDetails[])
            } catch (error) {
                console.error("Failed to fetch orders", error)
            }
        })
    }, [filter])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    const handlePay = async (orderId: string) => {
        if (!snapScriptLoaded) {
            toast.error("Payment system is loading, please try again in a moment.")
            return
        }

        try {
            const token = await createPaymentToken(orderId)
            
            if (window.snap) {
                window.snap.pay(token, {
                    onSuccess: function(result: any) {
                        // Refresh orders to show updated status
                        fetchOrders()
                        toast.success("Payment successful!")
                    },
                    onPending: function(result: any) {
                        fetchOrders()
                        toast("Payment pending...")
                    },
                    onError: function(result: any) {
                        console.error("Payment error", result)
                        toast.error("Payment failed")
                    },
                    onClose: function() {
                        // Maybe user closed without paying
                    }
                })
            }
        } catch (error) {
            console.error("Failed to initiate payment", error)
            toast.error("Failed to initiate payment. Please try again.")
        }
    }

    return (
        <div className="space-y-6">
            <Script 
                src={MIDTRANS_SNAP_URL} 
                data-client-key={MIDTRANS_CLIENT_KEY}
                onLoad={() => setSnapScriptLoaded(true)}
            />

            <OrderFilter currentFilter={filter} onFilterChange={setFilter} />

            {isLoading ? (
                 <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                 </div>
            ) : orders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order) => (
                        <OrderCard 
                            key={order.id} 
                            order={order} 
                            onPay={handlePay} 
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
                        {filter === "All Orders" 
                            ? "You haven't placed any orders yet." 
                            : `No ${filter.toLowerCase()} orders found.`}
                    </p>
                </div>
            )}
        </div>
    )
}
