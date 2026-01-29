import React from 'react'
import OrderList from '@/features/myOrders/components/OrderList'
import PhoneSetupReminderModal from '@/features/myOrders/components/PhoneSetupReminderModal'
import { getUserPhoneStatus } from '@/features/myOrders/action'

export default async function MyOrdersPage() {
  const user = await getUserPhoneStatus()
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto bg-white min-h-screen shadow-lg">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
        </header>
        
        <main className="p-4">
          <OrderList />
          <PhoneSetupReminderModal 
            phoneNumber={user?.phone} 
            remindPhoneSetup={user?.remindPhoneSetup ?? true} 
          />
        </main>
      </div>
    </div>
  )
}
