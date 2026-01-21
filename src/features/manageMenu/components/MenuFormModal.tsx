import { useState, useEffect } from 'react';
import { CreateMealInput, MealImageInput, OptionGroupInput, createMeal, updateMeal, ActionResult, MealWithRelations, SerializableMeal } from '../action';
import { Meal, MealCategory, MealOptionGroup, MealOptionValue, MealImage } from '@/generated/prisma/client';
import UploadButton from '@/components/UploadButton';
import OptionManager from './OptionManager';

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MealWithRelations;
  onSuccess: () => void;
}

const CATEGORIES: MealCategory[] = ['MEAL', 'SNACK', 'DRINK', 'DESSERT'];

export default function MenuFormModal({ isOpen, onClose, initialData, onSuccess }: MenuFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [category, setCategory] = useState<MealCategory>('MEAL');
  const [isAvailable, setIsAvailable] = useState(true);
  const [images, setImages] = useState<MealImageInput[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroupInput[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description);
        setPrice(initialData.price);
        setCategory(initialData.category);
        setIsAvailable(initialData.isAvailable);
        
        // Map images
        setImages(initialData.images.map(img => ({
            imagePath: img.imagePath,
            isPrimary: img.isPrimary,
            order: img.order
        })));

        // Map optionGroups (price is already number)
        setOptionGroups(initialData.optionGroups.map(group => ({
            id: group.id,
            name: group.name,
            isMultiple: group.isMultiple,
            isRequired: group.isRequired,
            values: group.values.map(val => ({
                id: val.id,
                name: val.name,
                price: val.price
            }))
        })));
      } else {
        // Reset for create mode
        setName('');
        setDescription('');
        setPrice(0);
        setCategory('MEAL');
        setIsAvailable(true);
        setImages([]);
        setOptionGroups([]);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload: CreateMealInput = {
      name,
      description,
      price,
      category,
      isAvailable,
      images,
      optionGroups,
    };

    let result: ActionResult<SerializableMeal>;

    if (initialData) {
      result = await updateMeal({ ...payload, id: initialData.id });
    } else {
      result = await createMeal(payload);
    }

    setIsLoading(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Something went wrong');
    }
  };

  const handleImageUpload = (results: any[]) => {
    const newImages = results.map((info, idx) => ({
      imagePath: info.secure_url,
      isPrimary: images.length === 0 && idx === 0, // First uploaded image is primary if detailed logic omitted
      order: images.length + idx,
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl m-4 p-6 relative max-h-[90vh] overflow-y-auto outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {initialData ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Basic Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Menu Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] focus:outline-none border p-2 bg-gray-50/50"
                  placeholder="e.g. Fried Rice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MealCategory)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] focus:outline-none border p-2 bg-gray-50/50"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">Rp </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    className="block w-full rounded-md border-gray-300 pl-8 focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] focus:outline-none p-2 border bg-gray-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] focus:outline-none border p-2 bg-gray-50/50"
                  placeholder="Delicious details..."
                />
              </div>

              <div className="flex items-center space-x-2">
                 <input
                    type="checkbox"
                    id="isAvailable"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="h-4 w-4 text-[#F97352] focus:ring-[#F97352] border-gray-300 rounded"
                  />
                 <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Available for Ordering</label>
              </div>
            </div>

            {/* Right Column: Images & Options */}
            <div className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                   <div className="grid grid-cols-3 gap-2 mb-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square group">
                          <img src={img.imagePath} alt={`Upload ${idx}`} className="w-full h-full object-cover rounded-lg border bg-gray-50" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                             </svg>
                          </button>
                          {img.isPrimary && <span className="absolute bottom-1 left-1 bg-orange-500/90 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">Main</span>}
                        </div>
                      ))}
                   </div>
                   <UploadButton onConfirmed={handleImageUpload} />
                </div>
            </div>
          </div>
          
          <div className="pt-6">
              <OptionManager groups={optionGroups} onChange={setOptionGroups} />
          </div>

          <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F97352] hover:bg-[#e06241] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97352] disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving...' : (initialData ? 'Update Menu' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
