import { Meal, MealCategory, MealImage, MealOptionGroup, MealOptionValue } from '@/generated/prisma/client';
import { deleteMeal, toggleMealAvailability, MealWithRelations } from '../action';
import { useState } from 'react';

interface MenuCardProps {
    meal: MealWithRelations;
    onEdit: (meal: MealWithRelations) => void;
    onDelete?: () => void;
    onToggle?: (updatedMeal: MealWithRelations) => void;
}

export default function MenuCard({ meal, onEdit, onDelete, onToggle }: MenuCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this menu item?')) {
            setIsDeleting(true);
            await deleteMeal(meal.id);
            setIsDeleting(false);
            if (onDelete) onDelete();
        }
    };

    const handleToggle = async () => {
        setIsToggling(true);
        const result = await toggleMealAvailability(meal.id);
        setIsToggling(false);
        if (result.success && result.data && onToggle) {
            onToggle(result.data);
        }
    };

    const primaryImage = meal.images.find(img => img.isPrimary) || meal.images[0];

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full animate-in fade-in zoom-in duration-300">
            <div className="relative h-48 bg-gray-200">
                {primaryImage ? (
                    <img 
                        src={primaryImage.imagePath} 
                        alt={meal.name} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${meal.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {meal.isAvailable ? 'Active' : 'Unavailable'}
                     </span>
                </div>
                <div className="absolute top-2 left-2">
                     <span className="px-2 py-1 text-xs font-semibold rounded-full bg-white/90 text-gray-800 shadow-sm border">
                        {meal.category}
                     </span>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{meal.name}</h3>
                    <span className="text-orange-600 font-bold">Rp {meal.price.toLocaleString('id-ID')}</span>
                </div>
                
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">{meal.description}</p>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                     <button
                        onClick={handleToggle}
                        disabled={isToggling}
                        className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                            meal.isAvailable 
                            ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                     >
                        {meal.isAvailable ? 'Disable' : 'Enable'}
                     </button>
                     
                     <div className="flex space-x-2">
                        <button 
                            onClick={() => onEdit(meal)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                            {isDeleting ? '...' : 'Delete'}
                        </button>
                     </div>
                </div>
            </div>
        </div>
    );
}
