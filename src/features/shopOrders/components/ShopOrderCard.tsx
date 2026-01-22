"use client"

import React from 'react'
import Image from 'next/image'
import { getShopOrders, updateOrderStatus } from '../action'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import toast from 'react-hot-toast'

// Use the actual return type from getShopOrders
type OrderWithDetails = Awaited<ReturnType<typeof getShopOrders>>[number]

interface ShopOrderCardProps {
    order: OrderWithDetails
    onStatusChange: () => void
}

export default function ShopOrderCard({ order, onStatusChange }: ShopOrderCardProps) {
    const [isLoading, setIsLoading] = React.useState(false)

    const handleStatusUpdate = async (newStatus: OrderStatus) => {
        setIsLoading(true)
        try {
            await updateOrderStatus(order.id, newStatus)
            toast.success(`Order marked as ${newStatus.toLowerCase()}`)
            onStatusChange()
        } catch (error: any) {
            toast.error(error.message || "Failed to update order status")
        } finally {
            setIsLoading(false)
        }
    }

    // Get dynamic button config
    const getActionButton = () => {
        const { orderStatus, paymentStatus } = order
        
        // Rule 1: PENDING + PENDING payment = no button
        if (orderStatus === OrderStatus.PENDING && paymentStatus === PaymentStatus.PENDING) {
            return null
        }
        
        // Rule 2: PENDING + PAID = Confirm button
        if (orderStatus === OrderStatus.PENDING && paymentStatus === PaymentStatus.PAID) {
            return {
                label: "Confirm",
                newStatus: OrderStatus.CONFIRMED,
                className: "bg-blue-500 hover:bg-blue-600",
            }
        }
        
        // Rule 3: CONFIRMED = Mark as Ready
        if (orderStatus === OrderStatus.CONFIRMED) {
            return {
                label: "Mark as Ready",
                newStatus: OrderStatus.READY,
                className: "bg-orange-500 hover:bg-orange-600",
            }
        }
        
        // Rule 4: READY = Mark as Completed
        if (orderStatus === OrderStatus.READY) {
            return {
                label: "Mark as Completed",
                newStatus: OrderStatus.COMPLETED,
                className: "bg-green-500 hover:bg-green-600",
            }
        }

        return null
    }

    const actionButton = getActionButton()

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {/* Header: User Info & Status */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                        {order.user.image ? (
                            <Image 
                                src={order.user.image} 
                                alt={order.user.name || "User"}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-500">
                                U
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{order.user.name}</h3>
                        <p className="text-xs text-gray-500">{order.user.phone || "No phone"}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className={`
                        px-2.5 py-1 rounded-full text-xs font-semibold
                        ${order.orderStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                        ${order.orderStatus === 'CONFIRMED' ? 'bg-orange-100 text-orange-700' : ''}
                        ${order.orderStatus === 'READY' ? 'bg-green-100 text-green-700' : ''}
                        ${order.orderStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : ''}
                        ${order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' : ''}
                    `}>
                        {order.orderStatus}
                    </span>
                    <span className={`
                        px-2 py-0.5 rounded text-xs font-semibold
                        ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                    `}>
                        {order.paymentStatus === 'PAID' ? 'PAID' : 'NOT PAID'}
                    </span>
                </div>
            </div>

            {/* Pickup Date */}
            {order.pickupDate && (
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    <span className="text-xs font-medium text-blue-700">
                        Pickup: {new Date(order.pickupDate).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </div>
            )}

            {/* Content: Order Items */}
            <div className="p-4 flex-1">
                <div className="space-y-3">
                    {order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-start gap-4">
                            <div className="flex items-start gap-2">
                                <span className="text-sm font-bold text-[#F97352]">{item.quantity}x</span>
                                <div className='flex flex-col'>
                                    <span className="text-sm text-gray-700 font-medium">{item.mealName}</span>
                                    {item.notes && <span className="text-xs text-gray-400 italic">"{item.notes}"</span>}
                                    {item.options.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {item.options.map((opt) => (
                                                <span key={opt.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                    {opt.optionName}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(item.price) * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer: Total & Actions */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(order.totalAmount))}
                    </span>
                </div>

                <div className="flex gap-2">
                    {actionButton && (
                        <button 
                            onClick={() => handleStatusUpdate(actionButton.newStatus)}
                            disabled={isLoading}
                            className={`px-5 py-2 text-white text-sm font-medium rounded-full shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${actionButton.className}`}
                        >
                            {isLoading ? "..." : actionButton.label}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
