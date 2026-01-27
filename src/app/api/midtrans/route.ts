import { NextRequest, NextResponse } from "next/server";
import { updatePaymentStatus } from "@/features/midtrans/action";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log the received notification for debugging
    console.log("[Midtrans Webhook] Notification Received:", {
      order_id: body.order_id,
      transaction_status: body.transaction_status,
      fraud_status: body.fraud_status,
      transaction_id: body.transaction_id,
    });

    const {
      order_id,
      transaction_status,
      fraud_status,
      transaction_id,
    } = body;

    if (!order_id) {
        console.error("[Midtrans Webhook] Missing order_id in notification");
        return NextResponse.json({ message: "Invalid notification: Missing order_id" }, { status: 400 });
    }
    
    const result = await updatePaymentStatus(
        order_id,
        transaction_status,
        fraud_status,
        transaction_id,
        body
    );

    if (!result.success) {
        console.error("[Midtrans Webhook] Failed to process notification:", result.error);
        return NextResponse.json({ message: "Notification processed with warning", error: result.error }, { status: 200 });
    }

    console.log("[Midtrans Webhook] Successfully processed notification for order:", order_id);
    return NextResponse.json({ message: "OK" }, { status: 200 });

  } catch (error) {
    console.error("Error handling Midtrans webhook:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
