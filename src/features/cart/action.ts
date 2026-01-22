'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Type definitions for Cart items with relations
export type CartItemWithDetails = {
    id: string;
    userId: string;
    mealId: string;
    quantity: number;
    notes: string | null;
    meal: {
        id: string;
        name: string;
        price: number; // Decimal converted to number for client
        description: string;
        shopId: string;
        shop: {
            id: string;
            name: string;
            fixedTimePickup: boolean;
            pickupTimes: {
              time: string;
            }[];
        };
        images: {
            imagePath: string;
        }[];
    };
    options: {
        mealOptionValue: {
            id: string;
            name: string;
            price: number; // Decimal converted to number
        };
    }[];
};

export async function getCartItems() {
    const session = await auth();
    if (!session?.user?.id) {
        return [];
    }

    const cartItems = await prisma.cartItem.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            meal: {
                include: {
                    shop: {
                        include: {
                            pickupTimes: true,
                        }
                    },
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                },
            },
            options: {
                include: {
                    mealOptionValue: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // Convert Decimals to numbers for client safety
    return cartItems.map(item => ({
        ...item,
        meal: {
            ...item.meal,
            price: Number(item.meal.price),
            shop: {
                ...item.meal.shop,
                pickupTimes: item.meal.shop.pickupTimes || [],
            }
        },
        options: item.options.map(opt => ({
            ...opt,
            mealOptionValue: {
                ...opt.mealOptionValue,
                price: Number(opt.mealOptionValue.price),
            },
        })),
    })) as CartItemWithDetails[];
}

export type CreateOrderState = {
    error?: string;
    token?: string; // Snap token
    redirectUrl?: string; // Midtrans redirect URL (optional)
};

export async function createOrder(
    prevState: CreateOrderState,
    formData: FormData
): Promise<CreateOrderState> {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: 'Unauthorized' };
    }

    const shopId = formData.get('shopId') as string;
    const pickupDateStr = formData.get('pickupDate') as string; // YYYY-MM-DD
    const pickupTime = formData.get('pickupTime') as string; // HH:MM
    const totalAmount = Number(formData.get('totalAmount')); // Should be calculated server-side normally, but for now validating slightly.

    if (!shopId || !pickupDateStr || !pickupTime) {
        return { error: 'Please select a shop and pickup time.' };
    }
    
    // Combine date and time
    const pickupDateTime = new Date(`${pickupDateStr}T${pickupTime}:00`);
    if (isNaN(pickupDateTime.getTime())) {
        return { error: 'Invalid pickup date/time.' };
    }

    // Fetch cart items for this shop
    const cartItems = await prisma.cartItem.findMany({
        where: {
            userId: session.user.id,
            meal: {
                shopId: shopId,
            },
        },
        include: {
            meal: true,
            options: {
                include: {
                    mealOptionValue: true,
                },
            },
        },
    });

    if (cartItems.length === 0) {
        return { error: 'No items in cart for this shop.' };
    }

    // Calculate total purely on server side to prevent tampering
    let calculatedTotal = 0;
    const orderItemsData = [];

    for (const item of cartItems) {
        let itemTotal = Number(item.meal.price);
        const itemOptions = [];

        for (const opt of item.options) {
            itemTotal += Number(opt.mealOptionValue.price);
            itemOptions.push({
                optionName: opt.mealOptionValue.name,
                price: opt.mealOptionValue.price,
            });
        }

        calculatedTotal += itemTotal * item.quantity;

        orderItemsData.push({
            mealId: item.mealId,
            mealName: item.meal.name,
            quantity: item.quantity,
            price: item.meal.price,
            notes: item.notes,
            options: {
                create: itemOptions,
            },
        });
    }

    const midtrans = new (require('midtrans-client').Snap)({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
    });

    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const parameter = {
        transaction_details: {
            order_id: orderId,
            gross_amount: calculatedTotal,
        },
        credit_card: {
            secure: true,
        },
        customer_details: {
            first_name: session.user.name,
            email: session.user.email,
        },
    };

    try {
        const transaction = await midtrans.createTransaction(parameter);
        const snapToken = transaction.token;
        const redirectUrl = transaction.redirect_url;

        // Save order to DB
        await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId: session.user.id,
                    shopId: shopId,
                    orderStatus: 'PENDING',
                    paymentStatus: 'PENDING',
                    midtransOrderId: orderId,
                    totalAmount: calculatedTotal,
                    snapToken: snapToken,
                    pickupDate: pickupDateTime,
                    orderItems: {
                        create: orderItemsData,
                    },
                },
            });

             // Clear cart for this shop
            await tx.cartItem.deleteMany({
                where: {
                    userId: session.user.id,
                    meal: {
                        shopId: shopId,
                    },
                },
            });
        });

        return { token: snapToken, redirectUrl };

    } catch (e: any) {
        console.error('Midtrans/DB Error:', e);
        return { error: e.message || 'Failed to create order' };
    }
}
