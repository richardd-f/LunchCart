import { EventEmitter } from 'events';

// A single in-process event bus that signals when a live-queue group changes.
// Status/payment mutations emit on a group key; SSE streams for orders in that
// group listen and recompute their snapshot. Works while the app runs as a
// single instance (Docker standalone build); swap to Postgres LISTEN/NOTIFY if
// the app is ever scaled horizontally.
const globalForQueue = globalThis as unknown as { queueEvents?: EventEmitter };

export const queueEvents = globalForQueue.queueEvents ?? new EventEmitter();
// Many concurrent SSE connections may subscribe; disable the default cap.
queueEvents.setMaxListeners(0);

if (process.env.NODE_ENV !== 'production') {
  globalForQueue.queueEvents = queueEvents;
}

/**
 * Build the event/group key for a (shop + pickup label + pickup day) bucket.
 * Label-mode orders on the same day share an identical pickupDate, so the day
 * granularity groups exactly the orders that share one live queue.
 */
export function queueGroupKey(shopId: string, label: string, pickupDate: Date | string): string {
  const d = typeof pickupDate === 'string' ? new Date(pickupDate) : pickupDate;
  const dayKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  return `queue:${shopId}::${label}::${dayKey}`;
}

/**
 * Notify any open SSE streams that a live-queue group has changed.
 * No-ops for orders without a label/date (i.e. not part of any live queue).
 */
export function emitQueueUpdate(
  shopId: string,
  label: string | null | undefined,
  pickupDate: Date | null | undefined
): void {
  if (!label || !pickupDate) return;
  queueEvents.emit(queueGroupKey(shopId, label, pickupDate));
}
