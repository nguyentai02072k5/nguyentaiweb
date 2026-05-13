"use client";

/**
 * timeline-spine.tsx — Animated SVG vertical spine for desktop Process Journey.
 *
 * Scroll-driven pathLength animation: line draws from top to bottom as user scrolls.
 * Hidden on mobile (uses border-l approach in parent instead).
 * Reduced motion: renders full line instantly without animation.
 */

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const SPINE_HEIGHT = 520; // px — approximate height of 6-step desktop layout
const DOT_POSITIONS = [0.08, 0.24, 0.41, 0.58, 0.75, 0.92]; // 6 evenly spaced dots

type TimelineSpineProps = {
  /** Section element ref for scroll tracking */
  sectionRef: React.RefObject<HTMLElement | null>;
};

export function TimelineSpine({ sectionRef }: TimelineSpineProps) {
  const shouldReduceMotion = useReducedMotion();
  const lineRef = useRef<SVGPathElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 80%', 'end 20%'],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    /* Desktop only — hidden on mobile via md: prefix in parent grid */
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 flex justify-center"
      style={{ height: SPINE_HEIGHT }}
    >
      <svg
        width="4"
        height={SPINE_HEIGHT}
        viewBox={`0 0 4 ${SPINE_HEIGHT}`}
        fill="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="spine-gradient" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Background track */}
        <path
          d={`M2 0 L2 ${SPINE_HEIGHT}`}
          stroke="#ebe7f2"
          strokeWidth="2"
        />

        {/* Animated fill line */}
        <motion.path
          ref={lineRef}
          d={`M2 0 L2 ${SPINE_HEIGHT}`}
          stroke="url(#spine-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          style={shouldReduceMotion ? { pathLength: 1 } : { pathLength }}
          initial={shouldReduceMotion ? undefined : { pathLength: 0 }}
        />

        {/* Dot markers at each step position */}
        {DOT_POSITIONS.map((pos, i) => (
          <circle
            key={i}
            cx="2"
            cy={SPINE_HEIGHT * pos}
            r="5"
            fill="#a855f7"
            stroke="#faf7ff"
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
}
