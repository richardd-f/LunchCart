'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';
import type { ReactNode } from 'react';

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  /** Seconds to delay the entrance (use for staggering siblings). */
  delay?: number;
  /** Pixels to travel upward while fading in. */
  y?: number;
  /** Animate only the first time it scrolls into view. */
  once?: boolean;
  /** Fraction of the element that must be visible before triggering. */
  amount?: number;
  /** Play on mount instead of waiting to scroll into view (for above-the-fold content). */
  immediate?: boolean;
}

/**
 * Fades + slides its children in when scrolled into view.
 * Falls back to no motion when the user prefers reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  once = true,
  amount = 0.2,
  immediate = false,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();

  // Above-the-fold content plays on mount; everything else waits to scroll into view.
  const trigger = immediate
    ? { animate: { opacity: 1, y: 0 } }
    : { whileInView: { opacity: 1, y: 0 }, viewport: { once, amount } };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      {...trigger}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
