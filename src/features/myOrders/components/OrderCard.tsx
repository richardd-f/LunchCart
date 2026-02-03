"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import QRCode from "react-qr-code"
import { toast } from 'react-toastify';
import { getMyOrders } from '../action'

// Use the actual return type from getMyOrders (with Decimal converted to number)
type OrderWithDetails = Awaited<ReturnType<typeof getMyOrders>>[number]

interface OrderCardProps {
    order: OrderWithDetails
    onPay: (orderId: string) => void
    onCancel: (orderId: string) => void
}

export default function OrderCard({ order, onPay, onCancel }: OrderCardProps) {
    const [showQR, setShowQR] = useState(false)

    const isPending = order.orderStatus === 'PENDING'
    const isPaymentPending = order.paymentStatus === 'PENDING' && isPending
    const showPayButton = isPaymentPending
    const showQRButton = order.orderStatus !== 'COMPLETED' && order.orderStatus !== 'CANCELLED'

    const handleShowQR = () => {
        if (order.paymentStatus !== 'PAID') {
            toast.error("Please complete the payment first")
            return
        }

        if (order.orderStatus !== 'READY') {
            toast("Order is not ready. Please wait until the food is READY. You will be notified via WhatsApp.", {
                icon: () => <span>⏳</span>,
                autoClose: 4000
            })
            return
        }

        setShowQR(true)
    }
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            {/* Header: Shop Info & Status */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                         {order.shop.profileImage ? (
                            <Image 
                                src={order.shop.profileImage} 
                                alt={order.shop.name}
                                fill
                                className="object-cover"
                            />
                         ) : (
                             <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-500">
                                S
                             </div>
                         )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{order.shop.name}</h3>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div>
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
                        ml-2 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                     `}>
                        {order.paymentStatus === 'PAID' ? 'PAID' : 'NOT PAID'}
                     </span>
                </div>
            </div>

            {/* Content: Order Items */}
            <div className="p-4 flex-1">
                <div className="space-y-3">
                    {order.orderItems.map((item) => {
                        // Calculate item total including options
                        const optionsTotal = item.options?.reduce((sum, opt) => sum + Number(opt.price), 0) || 0;
                        const itemSubtotal = (Number(item.price) + optionsTotal) * item.quantity;
                        
                        return (
                            <div key={item.id} className="flex justify-between items-start gap-4">
                                <div className="flex items-start gap-2">
                                    <span className="text-sm font-bold text-gray-700 text-[#F97352]">{item.quantity}x</span>
                                    <div className='flex flex-col'>
                                         <span className="text-sm text-gray-700 font-medium">{item.mealName}</span>
                                         {/* Display options */}
                                         {item.options && item.options.length > 0 && (
                                            <div className="mt-0.5 space-y-0.5">
                                                {item.options.map((opt, idx) => (
                                                    <div key={idx} className="flex items-center gap-1 text-xs text-gray-500">
                                                        <span>+ {opt.optionName}</span>
                                                        {Number(opt.price) > 0 && (
                                                            <span className="text-gray-400">
                                                                (+{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(opt.price))})
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                         )}
                                         {item.notes && <span className="text-xs text-gray-400 italic">"{item.notes}"</span>}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(itemSubtotal)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer: Total & Actions */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Total Price</span>
                    <span className="text-lg font-bold text-gray-900">
                         {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(order.totalAmount))}
                    </span>
                </div>

                <div className="flex gap-2">
                    {showPayButton && (
                         <button 
                            onClick={() => onPay(order.id)}
                            className="px-6 py-2 bg-[#F97352] hover:bg-[#e06241] text-white text-sm font-medium rounded-full shadow-md transition-all active:scale-95"
                         >
                            Pay
                        </button>
                    )}

                    {/* Cancel button - only show for PENDING orders that are NOT PAID */}
                    {order.orderStatus === 'PENDING' && order.paymentStatus !== 'PAID' && (
                        <button 
                            onClick={() => onCancel(order.id)}
                            className="px-6 py-2 bg-white border-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-sm font-medium rounded-full transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                    )}

                    {showQRButton && (
                        <button 
                             onClick={handleShowQR}
                             className="px-6 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-full shadow-md transition-all active:scale-95 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M2 2h2v2H2V2z"/>
                                <path d="M6 0v6H0V0h6zM5 1H1v4h4V1zM4 12H2v2h2v-2z"/>
                                <path d="M6 10v6H0v-6h6zm-5 1v4h4v-4H1z"/>
                                <path d="M8 0v16h8V0H8zm7 15H9V1h6v14z"/>
                            </svg>
                            
                        </button>
                    )}
                </div>
            </div>

             {/* QR Modal Overlay */}
             {showQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowQR(false)}>
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900">Order QR Code</h3>
                        <p className="text-sm text-gray-500 text-center">Show this to the shop staff to pick up your order.</p>
                        
                        <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl">
                            <QRCode 
                                value={order.id} 
                                size={200}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                        
                        <p className="text-xs font-mono bg-gray-100 px-3 py-1 rounded text-gray-500">{order.id}</p>

                        <button 
                            onClick={() => setShowQR(false)}
                            className="w-full py-2.5 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
