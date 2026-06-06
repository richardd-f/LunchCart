/**
 * Order-level discount engine (single source of truth for cart + checkout).
 *
 * Rules (locked decisions):
 * - A discount only applies when it is active AND the whole shop-order subtotal
 *   meets its `minOrderSubtotal` gate. The gate is order-level, never per-item.
 * - The percentage applies to the eligible meal's BASE price x quantity only
 *   (option add-ons are excluded). [D1]
 * - Each cart item takes its single best linked+qualifying discount (highest
 *   percentage). Cuts are then summed across items. [D2]
 * - `maxDiscountAmount` caps each discount's TOTAL rupiah off across every item
 *   it ends up applied to (0 = no cap).
 *
 * This module is pure and framework-agnostic so the cart UI (client) and the
 * checkout server action both compute identical numbers.
 */

export type DiscountRule = {
  id: string;
  name: string;
  percentage: number;
  minOrderSubtotal: number;
  maxDiscountAmount: number; // 0 = no cap
};

export type DiscountableItem = {
  /** (base + options) x quantity — counts toward subtotal and the min-order gate. */
  lineTotal: number;
  /** base price x quantity — the amount a discount percentage applies to (D1). */
  eligibleBase: number;
  /** Active discount ids linked to this item's meal. */
  discountIds: string[];
};

export type AppliedDiscount = {
  id: string;
  name: string;
  amount: number; // rupiah off, rounded, always > 0
};

export type DiscountResult = {
  subtotal: number;
  totalDiscount: number;
  total: number;
  applied: AppliedDiscount[];
};

/** Deterministic "best" pick for a single item: highest %, then biggest cap, then id. */
function pickBestRule(rules: DiscountRule[]): DiscountRule {
  return [...rules].sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    const capA = a.maxDiscountAmount > 0 ? a.maxDiscountAmount : Infinity;
    const capB = b.maxDiscountAmount > 0 ? b.maxDiscountAmount : Infinity;
    if (capB !== capA) return capB - capA;
    return a.id.localeCompare(b.id);
  })[0];
}

export function calculateOrderDiscounts(
  items: DiscountableItem[],
  rules: DiscountRule[]
): DiscountResult {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const ruleById = new Map(rules.map((r) => [r.id, r]));

  // Discounts whose order-level gate is satisfied by the current subtotal.
  const qualifyingIds = new Set(
    rules.filter((r) => subtotal >= r.minOrderSubtotal).map((r) => r.id)
  );

  // Per item, accumulate its eligible base onto the single best qualifying discount.
  const baseByDiscount = new Map<string, number>();
  for (const item of items) {
    if (item.eligibleBase <= 0) continue;
    const candidates = item.discountIds
      .filter((id) => qualifyingIds.has(id))
      .map((id) => ruleById.get(id))
      .filter((r): r is DiscountRule => Boolean(r));
    if (candidates.length === 0) continue;

    const best = pickBestRule(candidates);
    baseByDiscount.set(best.id, (baseByDiscount.get(best.id) ?? 0) + item.eligibleBase);
  }

  // Turn each discount's aggregated base into a capped, rounded rupiah amount.
  const applied: AppliedDiscount[] = [];
  for (const [id, base] of baseByDiscount) {
    const rule = ruleById.get(id)!;
    let amount = base * (rule.percentage / 100);
    if (rule.maxDiscountAmount > 0) amount = Math.min(amount, rule.maxDiscountAmount);
    amount = Math.round(amount);
    if (amount > 0) applied.push({ id, name: rule.name, amount });
  }

  applied.sort((a, b) => b.amount - a.amount);

  const totalDiscount = applied.reduce((sum, d) => sum + d.amount, 0);

  return {
    subtotal,
    totalDiscount,
    total: Math.max(0, subtotal - totalDiscount),
    applied,
  };
}
