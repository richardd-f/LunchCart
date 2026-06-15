"use client"

import React, { useEffect, useState } from "react"
import type { QueueStatus } from "../queue"

interface LiveQueueWidgetProps {
    orderId: string
}

export default function LiveQueueWidget({ orderId }: LiveQueueWidgetProps) {
    const [status, setStatus] = useState<QueueStatus | null>(null)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        const source = new EventSource(`/api/queue/${orderId}`)

        source.onopen = () => setConnected(true)

        source.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as QueueStatus | null
                setStatus(data)
                // Once the order is picked up or cancelled there is nothing left to track.
                if (data && (data.yourStatus === "COMPLETED" || data.yourStatus === "CANCELLED")) {
                    source.close()
                    setConnected(false)
                }
            } catch {
                /* ignore malformed frame */
            }
        }

        source.onerror = () => {
            // EventSource auto-reconnects; just reflect the transient state.
            setConnected(false)
        }

        return () => source.close()
    }, [orderId])

    // Not part of a live queue (e.g. payment not cleared yet) -> render nothing.
    if (!status) return null

    const isReady = status.yourStatus === "READY"
    const isBeingServed = !isReady && status.queueLeft === 0

    return (
        <div className="mx-4 mb-3 rounded-xl border border-[#F97352]/20 bg-gradient-to-br from-orange-50 to-amber-50 p-3">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#F97352]">Live Queue</span>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-gray-700 shadow-sm">
                    No. {status.yourNumber}
                </span>
            </div>

            {/* Status message */}
            {isReady ? (
                <p className="mb-2 text-sm font-semibold text-green-600">✓ Your meal is ready — pick it up!</p>
            ) : isBeingServed ? (
                <p className="mb-2 text-sm font-semibold text-[#F97352]">🍳 Your meal is being prepared now</p>
            ) : (
                <p className="mb-2 text-sm text-gray-600">
                    <span className="font-bold text-gray-900">{status.queueLeft}</span>{" "}
                    {status.queueLeft === 1 ? "order" : "orders"} ahead of you
                </p>
            )}

            {/* Numbers */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/70 py-1.5">
                    <div className="text-base font-bold text-gray-900">
                        {status.currentProcessed ?? "–"}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400">Now serving</div>
                </div>
                <div className="rounded-lg bg-white/70 py-1.5">
                    <div className="text-base font-bold text-[#F97352]">{status.yourNumber}</div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400">Your number</div>
                </div>
                <div className="rounded-lg bg-white/70 py-1.5">
                    <div className="text-base font-bold text-gray-900">{status.queueLeft}</div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400">Ahead</div>
                </div>
            </div>
        </div>
    )
}
