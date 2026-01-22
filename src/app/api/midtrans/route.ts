import { NextRequest, NextResponse } from "next/server";
import { updatePaymentStatus } from "@/features/midtrans/action";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log the received notification for debugging
    console.log("Midtrans Notification Received:", body);

    const {
      order_id,
      transaction_status,
      fraud_status,
      transaction_id,
    } = body;

    if (!order_id) {
        return NextResponse.json({ message: "Invalid notification: Missing order_id" }, { status: 400 });
    }

    // Call the server action to update the database
    // Note: We don't await this if we want to return 200 OK fast to Midtrans, 
    // but Next.js serverless functions might terminate. 
    // Best practice in Vercel/NextJS is to await it to ensure it completes.
    const result = await updatePaymentStatus(
        order_id,
        transaction_status,
        fraud_status,
        transaction_id,
        body
    );

    if (!result.success) {
        console.error("Failed to process Midtrans notification:", result.error);
        // Even if update fails internally (e.g. order not found), strictly speaking we might should return 404,
        // but Midtrans expects 200 OK to stop retrying. 
        // If it's a critical error (DB down), 500 will make them retry.
        // If Order Not Found, retrying won't help, so 200 is acceptable or 404.
        // Let's return 200 to acknowledge receipt to avoid retry loops for "Order Not Found".
        return NextResponse.json({ message: "Notification processed with warning", error: result.error }, { status: 200 });
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });

  } catch (error) {
    console.error("Error handling Midtrans webhook:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
