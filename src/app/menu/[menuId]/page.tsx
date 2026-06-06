import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getMealDetails } from '@/features/menu/action'
import MenuImages from '@/features/menu/components/MenuImages'
import ReviewSection from '@/features/menu/components/ReviewSection'
import AddToCartButtonWrapper from './AddToCartButtonWrapper'
import BackButton from './BackButton'
import { Reveal } from '@/components/Reveal'

export default async function MenuDetailsPage({ params }: { params: Promise<{ menuId: string }> }) {
    const { menuId } = await params
    const meal = await getMealDetails(menuId)

    if (!meal) {
        notFound()
    }

    return (
        <div className="relative flex flex-1 flex-col pb-24 md:pb-10">
            {/* Vertically + horizontally centered when content is shorter than the viewport */}
            <div className="mx-auto my-auto w-full max-w-7xl md:px-6 md:py-8">

                {/* Back Button (Mobile) */}
                <div className="md:hidden absolute top-4 left-4 z-10">
                    <BackButton />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-12">
                    {/* Left: Images */}
                    <Reveal y={16}>
                        <MenuImages images={meal.images} mealName={meal.name} />
                    </Reveal>

                    {/* Right: Details */}
                    <Reveal y={16} delay={0.1} className="px-4 py-6 md:py-0 space-y-6">
                        {/* Shop Header */}
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                             <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 shadow-sm border border-gray-100">
                                {meal.shop.profileImage ? (
                                    <Image src={meal.shop.profileImage} alt={meal.shop.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                        {meal.shop.name.charAt(0)}
                                    </div>
                                )}
                             </div>
                             <div>
                                 <h2 className="text-sm font-bold text-gray-900">{meal.shop.name}</h2>
                                 <p className="text-xs text-gray-500">Shop Location / Info</p>
                             </div>
                        </div>

                        {/* Title & Price */}
                        <div>
                            <div className="flex justify-between items-start">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">{meal.name}</h1>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-[#F97352]">
                                    Rp {Number(meal.price).toLocaleString('id-ID')}
                                </p>
                                {meal.hasActiveDiscount && (
                                    <span className="rounded-full bg-[#F97352]/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#F97352]">
                                        Promo
                                    </span>
                                )}
                            </div>
                             <div className="mt-1 flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meal.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {meal.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium uppercase">
                                    {meal.category}
                                </span>
                             </div>
                        </div>

                        {/* Description */}
                        <div className="prose prose-sm text-gray-600">
                            <p>{meal.description}</p>
                        </div>

                        {/* Add to Cart (Desktop View - inline) / Mobile Floating Action */}
                        <AddToCartButtonWrapper meal={meal} />

                        {/* Reviews */}
                        <ReviewSection latestReview={meal.orderItems[0]} />
                    </Reveal>
                </div>
            </div>
        </div>
    )
}