'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { getMealDetails, MealWithDetails } from '@/features/menu/action';
import AddToCartModal from '@/features/menu/components/AddToCartModal';

interface MenuCardAddButtonProps {
  mealId: string;
}

/**
 * Quick "+" on a menu card. The card itself is a <Link>, so this stops the
 * click from navigating, then loads the full meal (with its option groups)
 * and opens the shared AddToCartModal — which handles required options,
 * notes and quantity correctly. The modal is portaled to <body> so clicks
 * inside it don't bubble back up to the card link.
 */
export function MenuCardAddButton({ mealId }: MenuCardAddButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [meal, setMeal] = useState<MealWithDetails | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Reuse the already-fetched meal on subsequent opens.
    if (meal) {
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const details = await getMealDetails(mealId);
      if (!details) {
        toast.error('Could not load this item.');
        return;
      }
      setMeal(details);
      setIsOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Could not load this item.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        aria-label="Add to cart"
        className="w-8 h-8 rounded-full bg-orange-50 text-[#F97352] flex items-center justify-center hover:bg-[#F97352] hover:text-white transition-colors mb-1 disabled:opacity-70"
      >
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        )}
      </button>

      {meal &&
        createPortal(
          // React events bubble through the React tree even from a portal, so stop
          // them here — otherwise clicks inside the modal reach the card's <Link>.
          <div onClick={(e) => e.stopPropagation()}>
            <AddToCartModal meal={meal} isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </div>,
          document.body
        )}
    </>
  );
}
