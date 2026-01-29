"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { MealWithDetails } from '@/features/menu/action'
import AddToCartModal from '@/features/menu/components/AddToCartModal'

export default function AddToCartButtonWrapper({ meal }: { meal: MealWithDetails }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    const handleAddToCart = () => {
        if (!session) {
            router.push('/auth/signin')
            return
        }
        setIsModalOpen(true)
    }

    if (!meal.isAvailable) {
        return (
            <button disabled className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-xl cursor-not-allowed">
                Currently Unavailable
            </button>
        )
    }

    return (
        <>
            {/* Desktop Button - Inline */}
            <div className="hidden md:block pt-4">
                 <button
                    onClick={handleAddToCart}
                    className="w-full md:w-auto md:min-w-[200px] py-3 bg-[#F97352] hover:bg-[#e06241] text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Add to Cart
                </button>
            </div>

            {/* Mobile Button - Floating */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
                <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 bg-[#F97352] text-white font-bold rounded-xl shadow-xl shadow-orange-500/20 backdrop-blur-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Add to Cart
                </button>
            </div>

            <AddToCartModal 
                meal={meal} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </>
    )
}
