"use client";

/**
 * sketch-underline.tsx - F1 hand-drawn sketch underline (Framer Motion pathLength).
 *
 * Animates a violet→pink wavy underline under a keyword on viewport enter.
 * Reference: /animations SketchInContextHeadline.
 *
 * Reduced-motion: pathLength stays at 1 (fully drawn, no animation).
 * Drop-in usage: place inside a `position: relative` parent.
 */

import { motion, useReducedMotion } from 'framer-motion';

type SketchUnderlineProps = {
  /** Delay in seconds before pathLength animation starts. Default 0.6s. */
  delay?: number;
  /** Duration in seconds. Default 1.2s. */
  duration?: number;
};

export function SketchUnderline({ delay = 0.6, duration = 1.2 }: SketchUnderlineProps = {}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <svg
      aria-hidden="true"
      className="absolute left-0 -bottom-1 w-full pointer-events-none"
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
    >
      <motion.path
        d="M 5 6 C 50 0, 100 12, 195 4"
        stroke="url(#sketchUnderlineGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration, ease: [0.2, 0, 0, 1], delay }}
      />
      <defs>
        <linearGradient id="sketchUnderlineGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}
