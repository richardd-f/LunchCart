import React from 'react'
import ShopOrderList from '@/features/shopOrders/components/ShopOrderList'

export default function ShopOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto bg-white min-h-screen shadow-lg">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Shop Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage incoming orders for your shop</p>
        </header>
        
        <main className="p-4">
          <ShopOrderList />
        </main>
      </div>
    </div>
  )
}