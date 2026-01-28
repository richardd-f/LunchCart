"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { snap } from "@/lib/midtrans"
import { OrderStatus } from "@prisma/client"

export async function getMyOrders(statusFilter?: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const whereClause: any = {
        userId: session.user.id,
    }

    // Status Mapping Logic
    if (statusFilter && statusFilter !== "All Orders") {
        switch (statusFilter) {
            case "Pending":
                whereClause.orderStatus = OrderStatus.PENDING
                break
            case "Cooking":
                whereClause.orderStatus = OrderStatus.CONFIRMED
                break
            case "Ready":
                whereClause.orderStatus = OrderStatus.READY
                break
            case "Completed":
                whereClause.orderStatus = OrderStatus.COMPLETED
                break
            case "Cancelled":
                whereClause.orderStatus = OrderStatus.CANCELLED
                break
        }
    }

    const orders = await prisma.order.findMany({
        where: whereClause,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            shop: {
                select: {
                    name: true,
                    profileImage: true,
                },
            },
            orderItems: {
                include: {
                    meal: {
                        select: {
                            images: {
                                where: {
                                    isPrimary: true,
                                },
                                take: 1,
                            },
                        },
                    },
                    options: true,
                },
            },
        },
    })

    // Convert Decimal types to numbers for client component serialization
    return orders.map(order => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        orderItems: order.orderItems.map(item => ({
            ...item,
            price: Number(item.price),
            options: item.options.map(opt => ({
                ...opt,
                price: Number(opt.price),
            })),
        })),
    }))
}

/**
 * Creates or retrieves a Midtrans Snap Token for an order.
 */
export async function createPaymentToken(orderId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            user: true,
            orderItems: {
                include: {
                    options: true,
                },
            },
        },
    })

    if (!order) {
        throw new Error("Order not found")
    }

    // Ensure the order belongs to the user
    if (order.userId !== session.user.id) {
        throw new Error("Unauthorized access to order")
    }

    // If order already has a snapToken, return it instead of creating a new transaction
    if (order.snapToken && order.snapToken.length > 0) {
        return order.snapToken;
    }

    
    // Build item_details including options
    const itemDetails: { id: string; price: number; quantity: number; name: string }[] = [];
    let itemIndex = 0;
    
    for (const item of order.orderItems) {
        // Add base meal
        itemDetails.push({
            id: `ITEM-${itemIndex}`,
            price: Math.round(Number(item.price)),
            quantity: item.quantity,
            name: item.mealName.substring(0, 50),
        });
        
        // Add options as separate line items
        let optIndex = 0;
        for (const opt of item.options) {
            const optPrice = Math.round(Number(opt.price));
            if (optPrice > 0) {
                itemDetails.push({
                    id: `ITEM-${itemIndex}-OPT-${optIndex}`,
                    price: optPrice,
                    quantity: item.quantity,
                    name: `+ ${opt.optionName}`.substring(0, 50),
                });
            }
            optIndex++;
        }
        itemIndex++;
    }
    
    // Construct transaction details
    const parameter = {
        transaction_details: {
            order_id: order.midtransOrderId || order.id,
            gross_amount: Math.round(Number(order.totalAmount)),
        },
        customer_details: {
            first_name: order.user?.name || "Guest",
            email: order.user?.email || "",
            phone: order.user?.phone || "",
        },
        item_details: itemDetails,
    };

    try {
        const transaction = await snap.createTransaction(parameter);
        const token = transaction.token;

        // Update order with new token
        await prisma.order.update({
            where: { id: orderId },
            data: {
                snapToken: token,
                midtransOrderId: order.midtransOrderId, // Ensure we keep tracking this, although it shouldn't change here unless we re-issue IDs.
            },
        })

        return token;
    } catch (e) {
        console.error("Midtrans Error:", e)
        throw new Error("Failed to create payment token")
    }
}

/**
 * Cancel an order (only allowed if order is PENDING and not yet PAID)
 */
export async function cancelOrder(orderId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
    })

    if (!order) {
        throw new Error("Order not found")
    }

    // Ensure the order belongs to the user
    if (order.userId !== session.user.id) {
        throw new Error("Unauthorized access to order")
    }

    // Only allow cancellation if order is PENDING and payment is not PAID
    if (order.orderStatus !== OrderStatus.PENDING) {
        throw new Error("Only pending orders can be cancelled")
    }

    if (order.paymentStatus === "PAID") {
        throw new Error("Cannot cancel a paid order. Please contact the shop for refunds.")
    }

    // Update order status to CANCELLED
    await prisma.order.update({
        where: { id: orderId },
        data: { 
            orderStatus: OrderStatus.CANCELLED,
            paymentStatus: "CANCELLED",
        },
    })

    return { success: true }
}
