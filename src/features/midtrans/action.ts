"use server"

import { prisma } from "@/lib/prisma"
import { PaymentStatus, OrderStatus } from "@prisma/client"
import { sendWhatsApp } from "@/lib/gowa"
import { emitQueueUpdate } from "@/lib/queueEvents"

export async function updatePaymentStatus(
    midtransOrderId: string,
    transactionStatus: string,
    fraudStatus?: string,
    transactionId?: string,
    rawResponse?: any
) {
    console.log(`Updating payment status for Order ID: ${midtransOrderId}, Status: ${transactionStatus}`)

    // 1. Find the order with related data for notification
    const order = await prisma.order.findUnique({
        where: { midtransOrderId: midtransOrderId },
        include: {
            user: { select: { name: true } },
            shop: { select: { id: true, name: true } },
            orderItems: { 
                select: { 
                    mealName: true, 
                    quantity: true,
                    options: { select: { optionName: true } }
                } 
            },
        },
    })

    if (!order) {
        console.error(`Order not found for midtransOrderId: ${midtransOrderId}`)
        return { success: false, error: "Order not found" }
    }

    let newPaymentStatus: PaymentStatus = order.paymentStatus

    // 2. Map Midtrans status to PaymentStatus
    if (transactionStatus === "capture") {
        if (fraudStatus === "challenge") {
            newPaymentStatus = PaymentStatus.PENDING
        } else if (fraudStatus === "accept") {
            newPaymentStatus = PaymentStatus.PAID
        }
    } else if (transactionStatus === "settlement") {
        newPaymentStatus = PaymentStatus.PAID
    } else if (transactionStatus === "cancel" || transactionStatus === "deny" || transactionStatus === "expire") {
        newPaymentStatus = PaymentStatus.FAILED 
         // Or map specifically: 
         if (transactionStatus === "expire") newPaymentStatus = PaymentStatus.EXPIRED
         if (transactionStatus === "cancel") newPaymentStatus = PaymentStatus.CANCELLED
    } else if (transactionStatus === "pending") {
        newPaymentStatus = PaymentStatus.PENDING
    }

    const terminalStatuses: PaymentStatus[] = [PaymentStatus.PAID, PaymentStatus.CANCELLED, PaymentStatus.EXPIRED, PaymentStatus.FAILED]
    
    if (terminalStatuses.includes(order.paymentStatus) && newPaymentStatus === PaymentStatus.PENDING) {
        console.log(`Ignoring status downgrade: ${order.paymentStatus} -> ${newPaymentStatus} (out-of-order notification)`)
        return { success: true, message: "Status not updated (already terminal)" }
    }

    if (order.paymentStatus === newPaymentStatus) {
        console.log(`Status unchanged: ${newPaymentStatus}`)
        return { success: true, message: "Status unchanged" }
    }
    
    const dataToUpdate: any = {
        paymentStatus: newPaymentStatus,
        midtransTransactionId: transactionId,
        rawMidtransResponse: rawResponse ? JSON.parse(JSON.stringify(rawResponse)) : undefined,
    }

    if (newPaymentStatus === PaymentStatus.PAID) {
        dataToUpdate.paymentTime = new Date()
    }

    // Auto-cancel order if payment failed, expired, or cancelled
    // Only cancel if order is not already in a terminal state
    const paymentFailureStatuses: PaymentStatus[] = [
        PaymentStatus.FAILED, 
        PaymentStatus.EXPIRED, 
        PaymentStatus.CANCELLED
    ]
    const orderTerminalStatuses: OrderStatus[] = [OrderStatus.COMPLETED, OrderStatus.CANCELLED]
    
    if (paymentFailureStatuses.includes(newPaymentStatus) && !orderTerminalStatuses.includes(order.orderStatus)) {
        console.log(`Auto-cancelling order ${order.id} due to payment status: ${newPaymentStatus}`)
        dataToUpdate.orderStatus = OrderStatus.CANCELLED
    }

    try {
        const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: dataToUpdate,
        })
        console.log(`Order ${order.id} updated to ${newPaymentStatus}`)

        // Payment change alters queue membership (PAID enters, failure auto-cancels out).
        emitQueueUpdate(order.shopId, order.pickupLabel, order.pickupDate)

        // Send WhatsApp notification to shop staff when payment is PAID
        if (newPaymentStatus === PaymentStatus.PAID) {
            try {
                const shopStaff = await prisma.userShopRole.findMany({
                    where: {
                        shopId: order.shopId,
                        getNotification: true,
                    },
                    include: {
                        user: {
                            select: { phone: true, name: true },
                        },
                    },
                })

                // Build order items summary
                const itemsSummary = order.orderItems
                    .map(item => {
                        const options = item.options.map(opt => opt.optionName).join(', ')
                        return `• ${item.quantity}x ${item.mealName}${options ? ` (${options})` : ''}`
                    })
                    .join('\n')

                const formattedTotal = new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                }).format(Number(order.totalAmount))

                // Prioritize pickupLabel if available
                const formattedPickup = order.pickupLabel 
                    ? `${order.pickupLabel}`
                    : (order.pickupDate 
                        ? new Date(order.pickupDate).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                        })
                        : 'Tidak ditentukan')

                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunch.felitech.site';

                const message = `🛒 *Pesanan Baru - SUDAH DIBAYAR!*

👤 Pemesan: ${order.user?.name || 'Customer'}
📅 Ambil: ${formattedPickup}

📋 *Pesanan:*
${itemsSummary}

💰 *Total: ${formattedTotal}*

✅ Pembayaran sudah dikonfirmasi. Segera proses pesanan!
🔗 Shop Orders: ${appUrl}/dashboard/shop/shopOrders`

                // Send to all staff with notification enabled (fire and forget)
                for (const staff of shopStaff) {
                    if (staff.user.phone) {
                        sendWhatsApp(staff.user.phone, message).catch((err) => {
                            console.error('Failed to send payment notification to staff:', err)
                        })
                    }
                }
            } catch (notifError) {
                // Log but don't fail the update if notification fails
                console.error('Failed to send payment notification:', notifError)
            }
        }

        return { success: true, order: updatedOrder }
    } catch (error) {
        console.error("Error updating order payment status:", error)
        return { success: false, error: "Failed to update order" }
    }
}

