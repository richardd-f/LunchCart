
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableImageProps {
  id: string;
  imagePath: string;
  index: number;
  onRemove: (index: number) => void;
  isPrimary: boolean;
}

export function SortableImage({ id, imagePath, index, onRemove, isPrimary }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative aspect-square group cursor-move touch-manipulation`}
    >
      <img
        src={imagePath}
        alt={`Upload ${index}`}
        className="w-full h-full object-cover rounded-lg border bg-gray-50 select-none"
      />
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking remove
        onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             onRemove(index);
        }}
        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
      {/* Visual Indicator for Primary (First Item) */}
      {isPrimary && <span className="absolute bottom-1 left-1 bg-orange-500/90 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm">Main</span>}
      <div className="absolute inset-0 border-2 border-transparent hover:border-orange-300 rounded-lg pointer-events-none transition-colors" />
    </div>
  );
}
