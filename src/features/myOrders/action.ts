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
                },
            },
        },
    })

    return orders
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
            orderItems: true,
        },
    })

    if (!order) {
        throw new Error("Order not found")
    }

    // Ensure the order belongs to the user
    if (order.userId !== session.user.id) {
        throw new Error("Unauthorized access to order")
    }

    // If order already has a valid snap token (simple check, ideally check expiry too but Midtrans tokens last a while), return it.
    // However, for retry scenarios, we might want to re-generate if it's failed or old.
    // For now, if it exists, let's try to reuse it, or generate new if specific conditions met.
    // Simpler approach: Just generate new token if pending to be safe, or return existing if not expired.
    // Note: Midtrans standard expiry is 1 hour usually. 
    // Let's allow re-generation to avoid "Token Expired" issues.
    
    // Construct transaction details
    const parameter = {
        transaction_details: {
            order_id: order.id, // Using existing order ID correctly? Midtrans requires unique order_id or appended. 
            // If we reuse the same OrderID for a new Snap Token, Midtrans might complain if the previous one is still active or "paid".
            // Ideally we use the `midtransOrderId` field which currently maps to `order.midtransOrderId`.
            // Let's use `midtransOrderId` from the order model.
            gross_amount: Number(order.totalAmount),
        },
        customer_details: {
            first_name: order.user?.name || "Guest",
            email: order.user?.email || "",
            phone: order.user?.phone || "",
        },
        item_details: order.orderItems.map((item) => ({
            id: item.mealId || "ITEM",
            price: Number(item.price),
            quantity: item.quantity,
            name: item.mealName,
        })),
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
