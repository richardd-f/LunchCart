'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { getCartItems, createOrder, updateCartItemQuantity, CartItemWithDetails } from '@/features/cart/action';
import {
  calculateOrderDiscounts,
  DiscountableItem,
  DiscountResult,
  DiscountRule,
} from '@/features/discounts/calculateDiscount';
import { toast } from 'react-toastify';

const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

// Supported shop timezones are fixed-offset (no DST), same table as the server.
const TZ_OFFSETS: Record<string, string> = {
  'Asia/Jakarta': '+07:00',
  'Asia/Makassar': '+08:00',
  'Asia/Jayapura': '+09:00',
};

/**
 * Earliest pickup day (YYYY-MM-DD) still orderable for a Label Pickup shop:
 * orders for day D close X hours before D's midnight in the shop's timezone,
 * so with a cutoff the earliest option is usually tomorrow.
 */
const getMinLabelPickupDate = (timezone: string, cutoffHours: number): string => {
  const offset = TZ_OFFSETS[timezone] ?? '+07:00';
  const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: timezone }); // YYYY-MM-DD
  const shopToday = dayFmt.format(new Date());
  const base = new Date(`${shopToday}T00:00:00${offset}`).getTime();
  for (let i = 0; i <= 30; i++) {
    const dayStr = dayFmt.format(new Date(base + i * 86400000));
    const deadline = new Date(`${dayStr}T00:00:00${offset}`).getTime() - cutoffHours * 3600000;
    if (Date.now() <= deadline) return dayStr;
  }
  return dayFmt.format(new Date(base + 30 * 86400000));
};

// Define Snap type globally
declare global {
  interface Window {
    snap: any;
  }
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [groupedItems, setGroupedItems] = useState<Record<string, CartItemWithDetails[]>>({});
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [pickupLabel, setPickupLabel] = useState(''); // Added
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const items = await getCartItems();
        setCartItems(items);

        // Group by shop
        const grouped: Record<string, CartItemWithDetails[]> = {};
        items.forEach((item) => {
          const shopId = item.meal.shopId;
          if (!grouped[shopId]) {
            grouped[shopId] = [];
          }
          grouped[shopId].push(item);
        });
        setGroupedItems(grouped);
        
        // Optionally select the first shop if only one exists
        if (Object.keys(grouped).length === 1) {
          setSelectedShopId(Object.keys(grouped)[0]);
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        toast.error('Failed to load cart');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleShopSelect = (shopId: string) => {
    setSelectedShopId(shopId);
    setPickupTime(''); // Reset time when changing shop
    setPickupLabel(''); // Reset label when changing shop
  };

  const executeQuantityUpdate = async (itemId: string, newQuantity: number) => {
    // Optimistic update
    let updatedItems: CartItemWithDetails[];
    
    if (newQuantity < 1) {
      // Remove item from cart
      updatedItems = cartItems.filter(item => item.id !== itemId);
    } else {
      // Update quantity
      updatedItems = cartItems.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
    }
    
    setCartItems(updatedItems);
    
    // Update grouped items as well
    const grouped: Record<string, CartItemWithDetails[]> = {};
    updatedItems.forEach((item) => {
        const shopId = item.meal.shopId;
        if (!grouped[shopId]) {
        grouped[shopId] = [];
        }
        grouped[shopId].push(item);
    });
    setGroupedItems(grouped);
    
    // If no more items in selected shop, deselect it
    if (selectedShopId && (!grouped[selectedShopId] || grouped[selectedShopId].length === 0)) {
        setSelectedShopId(null);
    }

    try {
        await updateCartItemQuantity(itemId, newQuantity);
    } catch (error) {
        toast.error('Failed to update quantity');
        // Revert on error
        const items = await getCartItems();
        setCartItems(items);
        const groupedRevert: Record<string, CartItemWithDetails[]> = {};
        items.forEach((item) => {
        const shopId = item.meal.shopId;
        if (!groupedRevert[shopId]) {
            groupedRevert[shopId] = [];
        }
        groupedRevert[shopId].push(item);
        });
        setGroupedItems(groupedRevert);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // Use toast for confirmation
      toast(({ closeToast }) => (
        <div className="flex flex-col gap-2">
          <span className="font-medium text-gray-800">Remove this item from cart?</span>
          <div className="flex gap-2 justify-end">
             <button
              onClick={() => {
                if (closeToast) closeToast();
                // Do nothing
              }}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (closeToast) closeToast();
                executeQuantityUpdate(itemId, newQuantity);
              }}
              className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      ), { autoClose: 4000 });
      return;
    }
    
    // For non-deletion updates, proceed directly
    executeQuantityUpdate(itemId, newQuantity);
  };

  const getDiscountResult = (shopId: string): DiscountResult => {
    const items = groupedItems[shopId] || [];
    const ruleMap = new Map<string, DiscountRule>();
    const discountItems: DiscountableItem[] = items.map((item) => {
      const basePrice = Number(item.meal.price);
      const optionsSum = item.options.reduce((acc, opt) => acc + Number(opt.mealOptionValue.price), 0);
      item.meal.discounts.forEach((d) => {
        if (!ruleMap.has(d.id)) ruleMap.set(d.id, d);
      });
      return {
        lineTotal: (basePrice + optionsSum) * item.quantity,
        eligibleBase: basePrice * item.quantity,
        discountIds: item.meal.discounts.map((d) => d.id),
      };
    });
    return calculateOrderDiscounts(discountItems, Array.from(ruleMap.values()));
  };

  const calculateTotal = (shopId: string) => getDiscountResult(shopId).total;

  const handleOrder = async () => {
    if (!selectedShopId) {
      toast.error('Please select a shop to order from');
      return;
    }
    
    // Get shop details to check pickup mode
    const shop = groupedItems[selectedShopId][0].meal.shop;
    
    if (!pickupDate) {
         toast.error('Please select pickup date');
         return;
    }

    if (shop.isUsingTimePickup && !pickupTime) {
      toast.error('Please select pickup time');
      return;
    }

    if (!shop.isUsingTimePickup && !pickupLabel) {
       toast.error('Please select a pickup time');
       return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('shopId', selectedShopId);
    formData.append('pickupDate', pickupDate);
    formData.append('pickupTime', pickupTime);
    formData.append('pickupLabel', pickupLabel); // Added
    formData.append('totalAmount', calculateTotal(selectedShopId).toString());

    try {
      const result = await createOrder({}, formData);

      if (result.error) {
        toast.error(result.error);
        setIsProcessing(false);
        return;
      }

      if (result.token) {
        // Trigger Snap Popup
        window.snap.pay(result.token, {
          onSuccess: function(result: any) {
            toast.success('Payment successful!');
            router.push('/myOrders');
          },
          onPending: function(result: any) {
            toast.success('Waiting for payment...');
            router.push('/myOrders');
          },
          onError: function(result: any) {
            toast.error('Payment failed');
            setIsProcessing(false);
          },
          onClose: function() {
            toast('Customer closed the popup without finishing the payment');
            setIsProcessing(false);
            router.push('/myOrders'); // Or maybe stay on cart? The user might want to retry. But requirement said redirect to orders.
            // Requirement 5: "set the onclose snap popup to redirect to my orders."
          }
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F97352]"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-xl font-medium">Your cart is empty</p>
        <p className="mt-2 text-sm">Looks like you haven't added anything to your cart yet.</p>
        <button 
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-2 bg-[#F97352] text-white rounded-md hover:bg-[#e06646] transition-colors"
        >
            Start Shopping
        </button>
      </div>
    );
  }

  // Helper to get shop details from the first item
  const getShopDetails = (shopId: string) => {
    return groupedItems[shopId][0].meal.shop;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Script 
        src={process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' 
          ? 'https://app.midtrans.com/snap/snap.js' 
          : 'https://app.sandbox.midtrans.com/snap/snap.js'
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="space-y-6">
          {Object.entries(groupedItems).map(([shopId, items]) => {
            const shop = getShopDetails(shopId);
            const isSelected = selectedShopId === shopId;
            const discountResult = getDiscountResult(shopId);

            return (
              <div 
                key={shopId} 
                className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-200 ${
                  isSelected ? 'border-[#F97352] ring-1 ring-[#F97352]' : 'border-gray-200 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Shop Header & Selection */}
                <div 
                    className="flex items-center p-4 border-b border-gray-100 bg-gray-50 cursor-pointer"
                    onClick={() => handleShopSelect(shopId)}
                >
                  <div className="flex items-center h-5">
                    <input
                      id={`shop-${shopId}`}
                      name="shop-selection"
                      type="radio"
                      checked={isSelected}
                      onChange={() => handleShopSelect(shopId)}
                      className="focus:ring-[#F97352] h-4 w-4 text-[#F97352] border-gray-300"
                    />
                  </div>
                  <div className="ml-3 text-sm flex-1">
                    <label htmlFor={`shop-${shopId}`} className="font-medium text-gray-900 cursor-pointer">
                      Order from {shop.name}
                    </label>
                  </div>
                </div>

                {/* Items List */}
                <div className={`divide-y divide-gray-100 ${!isSelected ? 'pointer-events-none grayscale-[0.5]' : ''}`}>
                    {items.map((item) => (
                        <div key={item.id} className="p-4 flex gap-4">
                             <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                {item.meal.images?.[0]?.imagePath ? (
                                    <Image
                                        src={item.meal.images[0].imagePath}
                                        alt={item.meal.name}
                                        fill
                                        className="h-full w-full object-cover object-center"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                        <span className="text-xs text-gray-400">No Img</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-1 flex-col">
                                <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold">{item.meal.name}</h3>
                                            {item.meal.discounts.length > 0 && (
                                                <span className="rounded-full bg-[#F97352]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#F97352]">
                                                    Promo
                                                </span>
                                            )}
                                        </div>
                                        <div className="ml-4 text-sm font-normal">
                                          <span className="text-gray-400">
                                            {formatIDR(Number(item.meal.price))}
                                          </span>
                                        </div>
                                    </div>
                                    {item.options.length > 0 && (
                                        <ul className="mt-1 text-sm text-gray-500 list-disc list-inside">
                                            {item.options.map((opt) => (
                                                <li key={opt.mealOptionValue.id} className="flex justify-between w-full">
                                                    <span>{opt.mealOptionValue.name}</span>
                                                    <span className="text-gray-400">
                                                        {Number(opt.mealOptionValue.price) > 0 
                                                            ? `+${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(opt.mealOptionValue.price))}`
                                                            : '-'
                                                        }
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {item.notes && (
                                         <p className="mt-1 text-sm text-gray-500 italic">"{item.notes}"</p>
                                    )}
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm mt-4">
                                    <div className="flex items-center border border-gray-300 rounded-md">
                                        <button 
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                            className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                                        >
                                            -
                                        </button>
                                        <span className="px-3 py-1 border-x border-gray-300 min-w-[2.5rem] text-center font-medium">
                                            {item.quantity}
                                        </span>
                                        <button 
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                            className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p className="font-bold text-gray-900 text-lg">
                                        {formatIDR(
                                            (Number(item.meal.price) + item.options.reduce((acc, opt) => acc + Number(opt.mealOptionValue.price), 0)) * item.quantity
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Checkout Section (Only if selected) */}
                {isSelected && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
                                <input
                                    type="date"
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                    min={
                                        !shop.isUsingTimePickup && shop.labelOrderCutoffHours > 0
                                            ? getMinLabelPickupDate(shop.timezone, shop.labelOrderCutoffHours)
                                            : new Date().toISOString().split('T')[0]
                                    }
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
                                />
                                {!shop.isUsingTimePickup && shop.labelOrderCutoffHours > 0 && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Orders close at {String((24 - (shop.labelOrderCutoffHours % 24)) % 24).padStart(2, '0')}:00 the day before pickup.
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {shop.isUsingTimePickup ? "Pickup Time" : "Pickup Time"}
                                </label>
                                {shop.isUsingTimePickup ? (
                                    shop.fixedTimePickup ? (
                                        <select
                                            value={pickupTime}
                                            onChange={(e) => setPickupTime(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
                                        >
                                            <option value="">Select Time</option>
                                            {shop.pickupTimes?.map((pt: any) => (
                                                <option key={pt.id || pt.time} value={pt.time}>{pt.time}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="time"
                                            value={pickupTime}
                                            onChange={(e) => setPickupTime(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
                                        />
                                    )
                                ) : (
                                    <select
                                        value={pickupLabel}
                                        onChange={(e) => setPickupLabel(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
                                    >
                                        <option value="">Select Time</option>
                                        {shop.pickupLabels?.map((pl: any) => (
                                            <option key={pl.id || pl.label} value={pl.label}>{pl.label}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-200 mt-4 space-y-2">
                             <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatIDR(discountResult.subtotal)}</span>
                             </div>
                             {discountResult.applied.map((d) => (
                                <div key={d.id} className="flex items-center justify-between text-sm text-green-600">
                                   <span className="flex items-center gap-1">
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 014 12V7a4 4 0 014-4z" />
                                      </svg>
                                      {d.name}
                                   </span>
                                   <span>-{formatIDR(d.amount)}</span>
                                </div>
                             ))}
                             <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="text-base font-medium text-gray-900">Total</div>
                                <div className="text-xl font-bold text-[#F97352]">{formatIDR(discountResult.total)}</div>
                             </div>
                        </div>

                        <button
                            onClick={handleOrder}
                            disabled={isProcessing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#F97352] hover:bg-[#e06646] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97352] disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}