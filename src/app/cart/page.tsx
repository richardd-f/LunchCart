'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { getCartItems, createOrder, CartItemWithDetails } from '@/features/cart/action';
import { toast } from 'react-hot-toast';

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
  };

  const calculateTotal = (shopId: string) => {
    const items = groupedItems[shopId] || [];
    return items.reduce((sum, item) => {
      let itemPrice = Number(item.meal.price);
      item.options.forEach((opt) => {
          itemPrice += Number(opt.mealOptionValue.price);
      });
      return sum + (itemPrice * item.quantity);
    }, 0);
  };

  const handleOrder = async () => {
    if (!selectedShopId) {
      toast.error('Please select a shop to order from');
      return;
    }
    if (!pickupDate || !pickupTime) {
      toast.error('Please select pickup date and time');
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('shopId', selectedShopId);
    formData.append('pickupDate', pickupDate);
    formData.append('pickupTime', pickupTime);
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
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="space-y-6">
          {Object.entries(groupedItems).map(([shopId, items]) => {
            const shop = getShopDetails(shopId);
            const isSelected = selectedShopId === shopId;
            const shopTotal = calculateTotal(shopId);

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
                                        <h3>{item.meal.name}</h3>
                                        <p className="ml-4">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(item.meal.price))}
                                        </p>
                                    </div>
                                    {item.options.length > 0 && (
                                        <div className="mt-1 text-sm text-gray-500">
                                            {item.options.map((opt, idx) => (
                                                <span key={opt.mealOptionValue.id}>
                                                    {opt.mealOptionValue.name} (+{Number(opt.mealOptionValue.price)}){idx < item.options.length - 1 ? ', ' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {item.notes && (
                                         <p className="mt-1 text-sm text-gray-500 italic">"{item.notes}"</p>
                                    )}
                                </div>
                                <div className="flex flex-1 items-end justify-between text-sm">
                                    <p className="text-gray-500">Qty {item.quantity}</p>
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
                                    // Optionally enforce min date as today
                                    min={new Date().toISOString().split('T')[0]}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Time</label>
                                {shop.fixedTimePickup ? (
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
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                             <div className="text-base font-medium text-gray-900">
                                Total
                             </div>
                             <div className="text-xl font-bold text-[#F97352]">
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(shopTotal)}
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