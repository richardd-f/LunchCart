import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { queueEvents, queueGroupKey } from "@/lib/queueEvents"
import { computeQueueStatus } from "@/features/liveQueue/queue"

export const dynamic = "force-dynamic"

/**
 * SSE stream of a customer's live-queue position. Pushes an initial snapshot,
 * then re-pushes whenever the order's (shop+label+day) group changes via the
 * in-process event bus. A `null` payload means the order is not (or no longer)
 * part of a live queue, so the client should hide the widget.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 })
  }
  const userId = session.user.id
  const { orderId } = await params

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, shopId: true, pickupLabel: true, pickupDate: true },
  })

  if (!order || order.userId !== userId || !order.pickupLabel || !order.pickupDate) {
    return new Response("Not found", { status: 404 })
  }

  const key = queueGroupKey(order.shopId, order.pickupLabel, order.pickupDate)
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      let closed = false

      const send = (data: unknown) => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          /* stream already closed */
        }
      }

      const push = async () => {
        try {
          const status = await computeQueueStatus(orderId, userId)
          send(status)
        } catch (err) {
          console.error("queue SSE compute failed:", err)
        }
      }

      const onUpdate = () => {
        void push()
      }

      queueEvents.on(key, onUpdate)

      // Comment heartbeat keeps the connection alive through idle proxies.
      const heartbeat = setInterval(() => {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`))
        } catch {
          /* ignore */
        }
      }, 25000)

      const cleanup = () => {
        if (closed) return
        closed = true
        clearInterval(heartbeat)
        queueEvents.off(key, onUpdate)
        try {
          controller.close()
        } catch {
          /* already closed */
        }
      }

      req.signal.addEventListener("abort", cleanup)

      // Initial snapshot on connect.
      void push()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
