/**
 * Per-item discount PREVIEW for display surfaces (menu detail + cards).
 *
 * This is a best-case, single-item estimate so customers can see how much is off
 * and the resulting price. It mirrors the order-level engine's "best discount"
 * pick and per-discount cap, but it intentionally does NOT enforce the order-level
 * `minOrderSubtotal` gate — that gate depends on the whole cart, which the menu
 * surfaces don't have. The caller is expected to surface `minOrderSubtotal` as a
 * "Min. order" note where appropriate. The authoritative cut is still computed at
 * cart/checkout by `calculateOrderDiscounts`.
 */

export type DiscountPreviewRule = {
  percentage: number;
  minOrderSubtotal: number;
  maxDiscountAmount: number; // 0 = no cap
};

export type MealDiscountPreview = {
  percentage: number;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number; // rupiah off, always > 0
  minOrderSubtotal: number; // 0 = no minimum
};

/** Same "best" ordering as the engine: highest %, then biggest cap. */
function pickBest(rules: DiscountPreviewRule[]): DiscountPreviewRule {
  return [...rules].sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    const capA = a.maxDiscountAmount > 0 ? a.maxDiscountAmount : Infinity;
    const capB = b.maxDiscountAmount > 0 ? b.maxDiscountAmount : Infinity;
    return capB - capA;
  })[0];
}

export function getMealDiscountPreview(
  price: number,
  discounts: DiscountPreviewRule[]
): MealDiscountPreview | null {
  if (!discounts || discounts.length === 0 || price <= 0) return null;

  const best = pickBest(discounts);
  if (best.percentage <= 0) return null;

  let discountAmount = Math.round(price * (best.percentage / 100));
  if (best.maxDiscountAmount > 0) {
    discountAmount = Math.min(discountAmount, best.maxDiscountAmount);
  }
  if (discountAmount <= 0) return null;

  return {
    percentage: best.percentage,
    originalPrice: price,
    finalPrice: Math.max(0, price - discountAmount),
    discountAmount,
    minOrderSubtotal: best.minOrderSubtotal,
  };
}
