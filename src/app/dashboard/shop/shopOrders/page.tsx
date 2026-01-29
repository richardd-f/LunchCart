"use client"

import React, { useState } from 'react'
import ShopOrderList from '@/features/shopOrders/components/ShopOrderList'
import PickupScannerModal from '@/features/shopOrders/components/pickup/PickupScannerModal'
import CheckOrderScannerModal from '@/features/shopOrders/components/pickup/CheckOrderScannerModal'

export default function ShopOrdersPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isCheckOrderOpen, setIsCheckOrderOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto bg-white min-h-screen shadow-lg">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shop Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Manage incoming orders for your shop</p>
          </div>
          
          <div className="flex w-full md:w-auto gap-3">
            <button 
              onClick={() => setIsCheckOrderOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              Check Order
            </button>

            <button 
              onClick={() => setIsScannerOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-black transition-colors shadow-sm font-medium text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
              </svg>
              Update by QR
            </button>
          </div>
        </header>
        
        <main className="p-4">
          <ShopOrderList />
        </main>

        <PickupScannerModal 
          isOpen={isScannerOpen} 
          onClose={() => setIsScannerOpen(false)} 
        />

        <CheckOrderScannerModal
          isOpen={isCheckOrderOpen}
          onClose={() => setIsCheckOrderOpen(false)}
        />
      </div>
    </div>
  )
}