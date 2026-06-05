/**
 * Ambient background shared across every page.
 * Soft orange/amber gradient blobs drift slowly behind all content.
 * Pure CSS animation (cheap), fixed and non-interactive, sits at -z-10.
 * Honors prefers-reduced-motion (blobs hold still) via globals.css.
 */
export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-orange-50 via-white to-amber-50/60"
    >
      <div className="animate-blob-1 absolute -top-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-[#F97352]/20 blur-3xl" />
      <div className="animate-blob-2 absolute top-1/3 -right-32 h-[34rem] w-[34rem] rounded-full bg-amber-300/25 blur-3xl" />
      <div className="animate-blob-3 absolute -bottom-24 left-1/4 h-[26rem] w-[26rem] rounded-full bg-orange-200/30 blur-3xl" />
      {/* Subtle wash so the blobs read as a tint, not loud color */}
      <div className="absolute inset-0 bg-white/40" />
    </div>
  );
}
