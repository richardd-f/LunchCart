/**
 * Day-of-week scheduling for discounts.
 *
 * `Discount.activeDays` stores long English day names ("Monday"...), the same
 * convention as `OrderSchedule.day`. "Today" is always resolved in the shop's
 * timezone (`Shop.timezone`), so a Monday-only promo flips at the shop's
 * midnight, not the server's.
 */

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export const EVERY_DAY: string[] = [...WEEK_DAYS];

export const SHOP_TIMEZONES = [
  { value: 'Asia/Jakarta', label: 'WIB — Jakarta (UTC+7)' },
  { value: 'Asia/Makassar', label: 'WITA — Makassar (UTC+8)' },
  { value: 'Asia/Jayapura', label: 'WIT — Jayapura (UTC+9)' },
] as const;

const DEFAULT_TIMEZONE = 'Asia/Jakarta';

/** Long English day name ("Monday") for the current moment in the given timezone. */
export function getTodayName(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
    }).format(new Date());
  } catch {
    // Invalid/unknown timezone string in DB — fall back to WIB rather than crash.
    return new Intl.DateTimeFormat('en-US', {
      timeZone: DEFAULT_TIMEZONE,
      weekday: 'long',
    }).format(new Date());
  }
}

/**
 * Whether a discount's day schedule allows it right now in the shop's timezone.
 * An empty/missing list is treated as "every day" (the pre-feature behavior),
 * so legacy or malformed rows never silently kill a promo.
 */
export function isDiscountActiveToday(
  activeDays: string[] | null | undefined,
  timezone: string
): boolean {
  if (!activeDays || activeDays.length === 0) return true;
  return activeDays.includes(getTodayName(timezone));
}

/** Keep only valid day names, deduplicated, in Monday-first order. */
export function sanitizeActiveDays(days: string[] | undefined): string[] {
  if (!days) return EVERY_DAY;
  const set = new Set(days);
  return WEEK_DAYS.filter((d) => set.has(d));
}
