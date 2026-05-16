"use client";

/**
 * timeline-spine.tsx — Animated vertical spine for desktop Process Journey.
 *
 * Spans the actual height of the grid container via `inset-y-0`.
 * Scroll-driven scaleY animation: line draws from top to bottom as user scrolls.
 * Dots positioned at row centers (1 dot per row, 3 rows for 6 steps).
 * Hidden on mobile (uses border-l approach in parent instead).
 */

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const ROW_COUNT = 3; // 6 steps × 2 columns = 3 rows

type TimelineSpineProps = {
  /** Section element ref for scroll tracking */
  sectionRef: React.RefObject<HTMLElement | null>;
};

export function TimelineSpine({ sectionRef }: TimelineSpineProps) {
  const shouldReduceMotion = useReducedMotion();

  /* Offset: fill starts as section enters (80% from top), completes when
   * section end is still 60% from top — i.e. cards are still in view, not
   * scrolled past. Avoids the "half-filled line" feel when viewing mid-section. */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 80%', 'end 60%'],
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  /* Row centers — 3 rows, dot at center of each (1/6, 3/6, 5/6) */
  const dotPositions = Array.from(
    { length: ROW_COUNT },
    (_, i) => (i * 2 + 1) / (ROW_COUNT * 2),
  );

  return (
    /* Anchored to grid container (inset-y-0) — auto-matches actual content height */
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-border-strong/40" />

      {/* Animated gradient fill — anchored top, scales down */}
      <motion.div
        className="absolute inset-0 origin-top bg-gradient-to-b from-indigo-500 via-fuchsia-500 to-pink-500"
        style={shouldReduceMotion ? { scaleY: 1 } : { scaleY }}
        initial={shouldReduceMotion ? undefined : { scaleY: 0 }}
      />

      {/* Dot markers at row centers */}
      {dotPositions.map((pos, i) => (
        <span
          key={i}
          className="absolute left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-violet ring-2 ring-surface-base"
          style={{ top: `${pos * 100}%` }}
        />
      ))}
    </div>
  );
}
