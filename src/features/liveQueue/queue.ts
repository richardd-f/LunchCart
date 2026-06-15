import { prisma } from "@/lib/prisma"
import { OrderStatus, PaymentStatus } from "@prisma/client"

export type QueueStatus = {
    yourNumber: number          // your stable position in the day's queue
    currentProcessed: number | null // queue number currently being cooked (earliest pending), null if none
    queueLeft: number           // pending orders ahead of you
    totalInQueue: number        // total orders in the day's queue
    yourStatus: OrderStatus     // your order's own status
}

function dayWindow(date: Date) {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    return { start, end }
}

/**
 * Compute the live-queue snapshot for a single order.
 * Returns null when the order is not part of any live queue (not a live-queue
 * label, not paid yet, missing label/date, or not owned by the user).
 *
 * Queue rules (paid, non-cancelled orders for shop+label+day, sorted by createdAt):
 *  - yourNumber       = your 1-based position in that sorted list
 *  - currentProcessed = position of the earliest still-PENDING order (being cooked)
 *  - queueLeft        = count of PENDING orders created before you
 */
export async function computeQueueStatus(orderId: string, userId: string): Promise<QueueStatus | null> {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            userId: true,
            shopId: true,
            pickupLabel: true,
            pickupDate: true,
            orderStatus: true,
            paymentStatus: true,
        },
    })

    if (!order || order.userId !== userId) return null
    if (!order.pickupLabel || !order.pickupDate) return null

    // Only labels the seller flagged as live queue expose a queue.
    const liveLabel = await prisma.pickupLabel.findFirst({
        where: { shopId: order.shopId, label: order.pickupLabel, isLiveQueue: true },
        select: { id: true },
    })
    if (!liveLabel) return null

    const { start, end } = dayWindow(order.pickupDate)

    // The queue = paid, non-cancelled orders for this shop/label/day, oldest first.
    const group = await prisma.order.findMany({
        where: {
            shopId: order.shopId,
            pickupLabel: order.pickupLabel,
            pickupDate: { gte: start, lte: end },
            paymentStatus: PaymentStatus.PAID,
            orderStatus: { in: [OrderStatus.PENDING, OrderStatus.READY, OrderStatus.COMPLETED] },
        },
        orderBy: { createdAt: "asc" },
        select: { id: true, orderStatus: true },
    })

    const idx = group.findIndex((o) => o.id === order.id)
    // Order isn't in the queue yet (e.g. payment not cleared) -> hide widget.
    if (idx === -1) return null

    const firstPendingIdx = group.findIndex((o) => o.orderStatus === OrderStatus.PENDING)
    const currentProcessed = firstPendingIdx === -1 ? null : firstPendingIdx + 1

    let queueLeft = 0
    for (let i = 0; i < idx; i++) {
        if (group[i].orderStatus === OrderStatus.PENDING) queueLeft++
    }

    return {
        yourNumber: idx + 1,
        currentProcessed,
        queueLeft,
        totalInQueue: group.length,
        yourStatus: order.orderStatus,
    }
}
