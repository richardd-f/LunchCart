"use client"

import React from 'react'

interface ReviewSectionProps {
    latestReview?: {
        id: string
        rate: number | null
        reviewMsg: string | null
        createdAt: Date
        order: {
            user: {
                name: string
                image: string | null
            }
        }
    }
}

export default function ReviewSection({ latestReview }: ReviewSectionProps) {
    if (!latestReview) return null

    return (
        <div className="mt-8 pt-8 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Reviews</h3>
            
            <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        {latestReview.order.user.image ? (
                             <img src={latestReview.order.user.image} alt={latestReview.order.user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">
                                {latestReview.order.user.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <span className="font-semibold text-gray-900 text-sm">{latestReview.order.user.name}</span>
                            <span className="text-xs text-gray-400">{new Date(latestReview.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex text-yellow-400 my-1">
                             {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-4 h-4 ${i < (latestReview.rate || 0) ? 'fill-current' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                             ))}
                        </div>

                        <p className="text-gray-600 text-sm italic">"{latestReview.reviewMsg}"</p>
                    </div>
                </div>
            </div>

            <button className="w-full mt-4 text-center text-sm font-medium text-[#F97352] hover:text-[#d05c3f] transition-colors py-2 rounded-lg hover:bg-orange-50">
                View All Reviews
            </button>
        </div>
    )
}
