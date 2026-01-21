"use client"

import { useState } from 'react'
import Image from 'next/image'

interface MenuImagesProps {
    images: { id: string, imagePath: string, isPrimary: boolean }[]
    mealName: string
}

export default function MenuImages({ images, mealName }: MenuImagesProps) {
    const displayImages = images.length > 0 ? images : [{ id: 'default', imagePath: '/placeholder-food.jpg', isPrimary: true }]
    
    // Default to primary or first image
    const [selectedImage, setSelectedImage] = useState<string>(
        displayImages.find(img => img.isPrimary)?.imagePath || displayImages[0].imagePath
    )

    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div 
                className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 cursor-zoom-in shadow-sm hover:shadow-md transition-all group"
                onClick={() => setIsLightboxOpen(true)}
            >
                {selectedImage !== '/placeholder-food.jpg' ? (
                    <Image 
                        src={selectedImage} 
                        alt={mealName}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                )}
                
                {/* Zoom Hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                </div>
            </div>

            {/* Thumbnails (Only if there's more than 1 image) */}
            {displayImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-1">
                    {displayImages.map((img) => (
                        <div 
                            key={img.id}
                            className={`
                                relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer border-2 transition-all
                                ${selectedImage === img.imagePath 
                                    ? 'border-[#F97352] ring-2 ring-[#F97352]/20 scale-95' 
                                    : 'border-transparent hover:border-gray-300'
                                }
                            `}
                            onClick={() => setSelectedImage(img.imagePath)}
                        >
                            <Image 
                                src={img.imagePath} 
                                alt={mealName}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox / Zoom Modal */}
            {isLightboxOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <div className="relative w-full max-w-5xl max-h-[90vh] h-full flex items-center justify-center">
                        <div className="relative w-full h-full">
                            <Image 
                                src={selectedImage}
                                alt={mealName}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <button 
                            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsLightboxOpen(false);
                            }}
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
