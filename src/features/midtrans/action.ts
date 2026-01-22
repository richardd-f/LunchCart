"use server"

import { prisma } from "@/lib/prisma"
import { PaymentStatus, OrderStatus } from "@prisma/client"

export async function updatePaymentStatus(
    midtransOrderId: string,
    transactionStatus: string,
    fraudStatus?: string,
    transactionId?: string,
    rawResponse?: any
) {
    console.log(`Updating payment status for Order ID: ${midtransOrderId}, Status: ${transactionStatus}`)

    // 1. Find the order
    const order = await prisma.order.findUnique({
        where: { midtransOrderId: midtransOrderId },
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

    try {
        const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: dataToUpdate,
        })
        console.log(`Order ${order.id} updated to ${newPaymentStatus}`)
        return { success: true, order: updatedOrder }
    } catch (error) {
        console.error("Error updating order payment status:", error)
        return { success: false, error: "Failed to update order" }
    }
}
