'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendWhatsApp } from '@/lib/gowa';

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
            orderCutoffMinutes: number;
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
                id: item.meal.shop.id,
                name: item.meal.shop.name,
                fixedTimePickup: item.meal.shop.fixedTimePickup,
                orderCutoffMinutes: item.meal.shop.orderCutoffMinutes,
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

    // Fetch shop to get orderCutoffMinutes
    const shop = await prisma.shop.findUnique({
        where: { id: shopId },
        select: { orderCutoffMinutes: true, name: true },
    });

    if (!shop) {
        return { error: 'Shop not found.' };
    }

    // Validate order cutoff time
    if (shop.orderCutoffMinutes > 0) {
        const now = new Date();
        const cutoffDeadline = new Date(pickupDateTime.getTime() - shop.orderCutoffMinutes * 60 * 1000);
        
        if (now > cutoffDeadline) {
            const hoursBeforeNeeded = Math.ceil(shop.orderCutoffMinutes / 60);
            return { 
                error: `Orders for this pickup time must be placed at least ${shop.orderCutoffMinutes} minutes (${hoursBeforeNeeded}h) before pickup. Please choose a later pickup time.` 
            };
        }
    }

    // Calculate total purely on server side to prevent tampering
    let calculatedTotal = 0;
    const orderItemsData: {
        mealId: string;
        mealName: string;
        quantity: number;
        price: any;
        notes: string | null;
        options: {
            create: { optionName: string; price: any }[];
        };
    }[] = [];

    // Build Midtrans item_details array
    const midtransItems: {
        id: string;
        name: string;
        price: number;
        quantity: number;
    }[] = [];

    for (const item of cartItems) {
        const basePrice = Number(item.meal.price);
        let itemTotal = basePrice;
        const itemOptions: { optionName: string; price: any }[] = [];

        // Add base meal to Midtrans items
        midtransItems.push({
            id: item.mealId,
            name: item.meal.name.substring(0, 50), // Midtrans limits name to 50 chars
            price: basePrice,
            quantity: item.quantity,
        });

        for (const opt of item.options) {
            const optionPrice = Number(opt.mealOptionValue.price);
            itemTotal += optionPrice;
            itemOptions.push({
                optionName: opt.mealOptionValue.name,
                price: opt.mealOptionValue.price,
            });

            // Add option as separate line item to Midtrans (only if price > 0)
            if (optionPrice > 0) {
                midtransItems.push({
                    id: `${item.mealId}-opt-${opt.mealOptionValue.id}`,
                    name: `+ ${opt.mealOptionValue.name}`.substring(0, 50),
                    price: optionPrice,
                    quantity: item.quantity,
                });
            }
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
        item_details: midtransItems,
        credit_card: {
            secure: true,
        },
        customer_details: {
            first_name: session.user.name,
            email: session.user.email,
        },
    };

    try {
        // IMPORTANT: Create order in DB FIRST, before Midtrans transaction
        // This prevents race condition where Midtrans webhook arrives before order exists
        const order = await prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    userId: session.user.id,
                    shopId: shopId,
                    orderStatus: 'PENDING',
                    paymentStatus: 'PENDING',
                    midtransOrderId: orderId,
                    totalAmount: calculatedTotal,
                    snapToken: '', // Will be updated after Midtrans transaction
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

            return createdOrder;
        });

        // Now create Midtrans transaction AFTER order exists in DB
        const transaction = await midtrans.createTransaction(parameter);
        const snapToken = transaction.token;
        const redirectUrl = transaction.redirect_url;

        // Update order with the snap token
        await prisma.order.update({
            where: { id: order.id },
            data: { snapToken: snapToken },
        });

        // Send WhatsApp notification to shop owners/staff with getNotification enabled
        try {
            const shopStaff = await prisma.userShopRole.findMany({
                where: {
                    shopId: shopId,
                    getNotification: true,
                },
                include: {
                    user: {
                        select: { phone: true, name: true },
                    },
                },
            });

            // Build order items summary
            const itemsSummary = orderItemsData
                .map(item => `• ${item.quantity}x ${item.mealName}`)
                .join('\n');

            const formattedTotal = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
            }).format(calculatedTotal);

            const formattedPickup = pickupDateTime.toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
            });

            const message = `🛒 *Pesanan Baru!*

👤 Pemesan: ${session.user.name || 'Customer'}
📅 Ambil: ${formattedPickup}

📋 *Pesanan:*
${itemsSummary}

💰 *Total: ${formattedTotal}*

Segera konfirmasi pesanan di aplikasi.`;

            // Send to all staff with notification enabled (fire and forget)
            // for (const staff of shopStaff) {
            //     if (staff.user.phone) {
            //         sendWhatsApp(staff.user.phone, message).catch((err) => {
            //             console.error('Failed to send order notification to staff:', err);
            //         });
            //     }
            // }
        } catch (notifError) {
            // Log but don't fail the order if notification fails
            console.error('Failed to send order notification:', notifError);
        }

        return { token: snapToken, redirectUrl };

    } catch (e: any) {
        console.error('Midtrans/DB Error:', e);
        return { error: e.message || 'Failed to create order' };
    }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    if (quantity < 1) {
         // Optionally delete, but for now just don't allow < 1 or handle delete in a separate action if needed. 
         // Assuming UI prevents < 1, but safety check:
         // If logic requires deletion on 0, w can add it. 
         // For now, let's enforce min 1.
         return; 
    }

    // Verify ownership
    const cartItem = await prisma.cartItem.findUnique({
        where: { id: cartItemId },
    });

    if (!cartItem || cartItem.userId !== session.user.id) {
        throw new Error('Cart item not found or unauthorized');
    }

    await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
    });
    
    // Revalidation is handled by the page calling this, or we can revalidate path. 
    // Since page uses local state initially initialized by server action, 
    // we might want to return the new list or let the client update optimistically/fetch again.
    // The current page fetches on mount. 
    // Ideally we return the updated list to keep it simple for the client to update state.
    return getCartItems();
}
