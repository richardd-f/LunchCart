import { useState, useEffect } from 'react';
import { CreateMealInput, MealImageInput, OptionGroupInput, createMeal, updateMeal, ActionResult, MealWithRelations, SerializableMeal } from '../action';
import { MealCategory } from '@prisma/client';
import UploadButton from '@/components/UploadButton';
import OptionManager from './OptionManager';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableImage } from './SortableImage';

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MealWithRelations;
  onSuccess: () => void;
}

const CATEGORIES: MealCategory[] = ['MEAL', 'SNACK', 'DRINK', 'DESSERT', 'TOOL', 'SAUCE'];

export default function MenuFormModal({ isOpen, onClose, initialData, onSuccess }: MenuFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [category, setCategory] = useState<MealCategory>('MEAL');
  const [isAvailable, setIsAvailable] = useState(true);
  const [allowNotes, setAllowNotes] = useState(false);
  const [images, setImages] = useState<MealImageInput[]>([]);
  const [optionGroups, setOptionGroups] = useState<OptionGroupInput[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description);
        setPrice(initialData.price);
        setDiscountPrice(initialData.discountPrice || 0);
        setCategory(initialData.category);
        setIsAvailable(initialData.isAvailable);
        setAllowNotes(initialData.allowNotes ?? false);
        
        // Map images
        setImages(initialData.images.map(img => ({
            imagePath: img.imagePath,
            isPrimary: img.isPrimary,
            order: img.order
        })));

        // Map optionGroups
        setOptionGroups(initialData.optionGroups.map(group => ({
            id: group.id,
            name: group.name,
            isMultiple: group.isMultiple,
            isRequired: group.isRequired,
            values: group.values.map(val => ({
                id: val.id,
                name: val.name,
                price: Number(val.price)
            }))
        })));
      } else {
        // Reset for create mode - ensure everything is cleared
        setName('');
        setDescription('');
        setPrice(0);
        setDiscountPrice(0);
        setCategory('MEAL');
        setIsAvailable(true);
        setAllowNotes(false);
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

    // Ensure strict order and isPrimary logic before submission
    const processedImages = images.map((img, idx) => ({
        ...img,
        order: idx,
        isPrimary: idx === 0
    }));

    const payload: CreateMealInput = {
      name,
      description,
      price,
      discountPrice,
      category,
      isAvailable,
      allowNotes,
      images: processedImages,
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
    // Use functional update to avoid stale closure issue
    setImages(prevImages => {
      const startIdx = prevImages.length;
      const newImages = results.map((info, idx) => ({
        imagePath: info.secure_url,
        isPrimary: startIdx === 0 && idx === 0,
        order: startIdx + idx,
      }));
      
      // Combine and re-normalize order
      const combinedImages = [...prevImages, ...newImages].map((img, idx) => ({
          ...img,
          order: idx,
          isPrimary: idx === 0
      }));
      
      return combinedImages;
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    // Re-calculate order and primary
    const reorderedImages = newImages.map((img, idx) => ({
        ...img,
        order: idx,
        isPrimary: idx === 0
    }));
    setImages(reorderedImages);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.imagePath === active.id);
        const newIndex = items.findIndex((item) => item.imagePath === over.id);
        
        if (oldIndex === -1 || newIndex === -1) return items;

        const newImages = arrayMove(items, oldIndex, newIndex);
        
        // Re-assign order and isPrimary based on new positions
        return newImages.map((img, idx) => ({
             ...img,
             order: idx,
             isPrimary: idx === 0
        }));
      });
    }
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
                <label className="block text-sm font-medium text-gray-700">Discount Price <span className="text-xs text-gray-500">(Optional, 0 to disable)</span></label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">Rp </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(parseFloat(e.target.value))}
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

              <div className="flex items-center space-x-2">
                 <input
                    type="checkbox"
                    id="allowNotes"
                    checked={allowNotes}
                    onChange={(e) => setAllowNotes(e.target.checked)}
                    className="h-4 w-4 text-[#F97352] focus:ring-[#F97352] border-gray-300 rounded"
                  />
                 <label htmlFor="allowNotes" className="text-sm font-medium text-gray-700">Allow Customer Notes</label>
              </div>
            </div>

            {/* Right Column: Images & Options */}
            <div className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Images (Drag to reorder)</label>
                   <p className="text-xs text-gray-500 mb-2">First image will be the primary/cover image.</p>
                   
                   <DndContext 
                      sensors={sensors} 
                      collisionDetection={closestCenter} 
                      onDragEnd={handleDragEnd}
                   >
                     <SortableContext 
                        items={images.map(img => img.imagePath)} 
                        strategy={rectSortingStrategy}
                     >
                       <div className="grid grid-cols-3 gap-2 mb-2">
                          {images.map((img, idx) => (
                             <SortableImage 
                                key={img.imagePath} 
                                id={img.imagePath} 
                                imagePath={img.imagePath} 
                                index={idx} 
                                onRemove={removeImage} 
                                isPrimary={img.isPrimary} 
                             />
                          ))}
                       </div>
                     </SortableContext>
                   </DndContext>
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
