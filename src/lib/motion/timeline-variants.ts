/**
 * timeline-variants.ts — Framer Motion variants for Process Journey timeline.
 *
 * Alternating left/right card reveal for desktop, slide-up for mobile.
 * All durations 0.5s, EASE_OUT cubic-bezier matching site standard.
 */

import type { Variants } from 'framer-motion';

const EASE_OUT: [number, number, number, number] = [0.2, 0, 0, 1];

/** Container: stagger children with 0.12s gap */
export const timelineContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0 },
  },
};

/** Odd-indexed steps (1, 3, 5) — slide in from left */
export const stepCardLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

/** Even-indexed steps (2, 4, 6) — slide in from right */
export const stepCardRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

/** Mobile single-column — slide up from below */
export const stepCardMobile: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

/** Number badge — scale + slight rotation entrance */
export const numberBadgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7, rotate: -8 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

/** Generic fade-in for trust strip signals */
export const fadeInVariant: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};
