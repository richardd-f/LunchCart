"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client"

// Types for filter parameters
export interface ShopOrderFilters {
    pickupDate?: string // ISO date string "YYYY-MM-DD" - single day filter
    mealIds?: string[] // Multi-select meal IDs
    optionNames?: string[] // Multi-select option names
    statusFilter?: string // "All", "Pending", "Confirmed", "Ready", "Completed"
}

// Type for aggregated summary
export interface OrderAggregation {
    mealName: string
    mealId: string
    totalQuantity: number
    breakdown: {
        key: string // "plain" | option name | notes snippet
        quantity: number
    }[]
}

/**
 * Get the shop ID for the current user if they are OWNER or STAFF
 */
async function getUserShopId(): Promise<string | null> {
    const session = await auth()
    if (!session?.user?.id) return null

    const shopRole = await prisma.userShopRole.findFirst({
        where: {
            userId: session.user.id,
            role: { in: ["OWNER", "STAFF"] },
        },
        select: { shopId: true },
    })

    return shopRole?.shopId ?? null
}

/**
 * Get orders for the shop owned/staffed by the current user
 */
export async function getShopOrders(filters: ShopOrderFilters = {}) {
    const shopId = await getUserShopId()
    if (!shopId) {
        throw new Error("Unauthorized: You must be a shop owner or staff")
    }

    // Build where clause
    const whereClause: Prisma.OrderWhereInput = {
        shopId,
    }

    // Status filter
    if (filters.statusFilter && filters.statusFilter !== "All") {
        const statusMap: Record<string, OrderStatus> = {
            "Pending": OrderStatus.PENDING,
            "Confirmed": OrderStatus.CONFIRMED,
            "Ready": OrderStatus.READY,
            "Completed": OrderStatus.COMPLETED,
            "Cancelled": OrderStatus.CANCELLED,
        }
        if (statusMap[filters.statusFilter]) {
            whereClause.orderStatus = statusMap[filters.statusFilter]
        }
    }

    // Pickup date filter
    if (filters.pickupDate) {
        const startOfDay = new Date(filters.pickupDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(filters.pickupDate)
        endOfDay.setHours(23, 59, 59, 999)
        
        whereClause.pickupDate = {
            gte: startOfDay,
            lte: endOfDay,
        }
    }

    // Meal filter - applied via orderItems (multi-select)
    if (filters.mealIds && filters.mealIds.length > 0) {
        whereClause.orderItems = {
            some: {
                mealId: { in: filters.mealIds },
            },
        }
    }

    const orders = await prisma.order.findMany({
        where: whereClause,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    image: true,
                },
            },
            orderItems: {
                include: {
                    options: true,
                    meal: {
                        select: {
                            images: {
                                where: { isPrimary: true },
                                take: 1,
                            },
                        },
                    },
                },
            },
        },
    })

    // Convert Decimal types to numbers
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
 * Compute aggregation summary for filtered orders
 */
export async function getOrderAggregation(filters: ShopOrderFilters = {}): Promise<OrderAggregation[]> {
    const shopId = await getUserShopId()
    if (!shopId) {
        throw new Error("Unauthorized: You must be a shop owner or staff")
    }

    // Build base where clause for orders
    const orderWhereClause: Prisma.OrderWhereInput = {
        shopId,
        // Only aggregate orders that are actionable or need prep
        orderStatus: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] },
        paymentStatus: PaymentStatus.PAID, // Only count paid orders
    }

    // Pickup date filter
    if (filters.pickupDate) {
        const startOfDay = new Date(filters.pickupDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(filters.pickupDate)
        endOfDay.setHours(23, 59, 59, 999)
        
        orderWhereClause.pickupDate = {
            gte: startOfDay,
            lte: endOfDay,
        }
    }

    // Fetch order items for aggregation
    const orderItems = await prisma.orderItem.findMany({
        where: {
            order: orderWhereClause,
            ...(filters.mealIds && filters.mealIds.length > 0 ? { mealId: { in: filters.mealIds } } : {}),
        },
        include: {
            options: true,
        },
    })

    // Build aggregation map
    const aggregationMap = new Map<string, OrderAggregation>()

    for (const item of orderItems) {
        const mealKey = item.mealId || item.mealName
        
        if (!aggregationMap.has(mealKey)) {
            aggregationMap.set(mealKey, {
                mealName: item.mealName,
                mealId: item.mealId || "",
                totalQuantity: 0,
                breakdown: [],
            })
        }

        const agg = aggregationMap.get(mealKey)!
        agg.totalQuantity += item.quantity

        // Determine breakdown key
        let breakdownKey = "Plain (no notes/options)"
        
        if (item.options.length > 0) {
            // Group by options
            const optionNames = item.options.map(o => o.optionName).sort().join(", ")
            breakdownKey = optionNames
        } else if (item.notes && item.notes.trim()) {
            // Group by notes
            const noteSnippet = item.notes.length > 30 ? item.notes.slice(0, 30) + "..." : item.notes
            breakdownKey = `Notes: "${noteSnippet}"`
        }

        // Find or create breakdown entry
        const existingBreakdown = agg.breakdown.find(b => b.key === breakdownKey)
        if (existingBreakdown) {
            existingBreakdown.quantity += item.quantity
        } else {
            agg.breakdown.push({ key: breakdownKey, quantity: item.quantity })
        }
    }

    return Array.from(aggregationMap.values())
}

/**
 * Get list of meals for the shop (for filter dropdown)
 */
export async function getShopMeals() {
    const shopId = await getUserShopId()
    if (!shopId) {
        throw new Error("Unauthorized: You must be a shop owner or staff")
    }

    const meals = await prisma.meal.findMany({
        where: { shopId },
        select: {
            id: true,
            name: true,
            optionGroups: {
                include: {
                    values: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: { name: "asc" },
    })

    return meals
}

/**
 * Update order status with validation
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const shopId = await getUserShopId()
    if (!shopId) {
        throw new Error("Unauthorized: You must be a shop owner or staff")
    }

    // Fetch order and verify it belongs to the shop
    const order = await prisma.order.findUnique({
        where: { id: orderId },
    })

    if (!order) {
        throw new Error("Order not found")
    }

    if (order.shopId !== shopId) {
        throw new Error("Unauthorized: This order does not belong to your shop")
    }

    // Validate status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        [OrderStatus.CONFIRMED]: [OrderStatus.READY, OrderStatus.CANCELLED],
        [OrderStatus.READY]: [OrderStatus.COMPLETED],
        [OrderStatus.COMPLETED]: [],
        [OrderStatus.CANCELLED]: [],
    }

    if (!validTransitions[order.orderStatus].includes(newStatus)) {
        throw new Error(`Invalid status transition: ${order.orderStatus} -> ${newStatus}`)
    }

    // For PENDING -> CONFIRMED, payment must be PAID
    if (order.orderStatus === OrderStatus.PENDING && newStatus === OrderStatus.CONFIRMED) {
        if (order.paymentStatus !== PaymentStatus.PAID) {
            throw new Error("Cannot confirm order: Payment is not completed")
        }
    }

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: newStatus },
    })

    return { success: true, orderStatus: updatedOrder.orderStatus }
}
