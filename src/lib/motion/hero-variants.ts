/**
 * hero-variants.ts — Framer Motion animation variants for Hero section.
 *
 * Timeline (owner-tuned 2026-05-12 — title phase shortened 2s → 1.2s):
 *   t=0.00s    → Eyebrow fade-in (0.3s)
 *   t=0.30s    → Title 4 lines start
 *   t=0.30s    → Line 1
 *   t=0.55s    → Line 2  (each line stagger 0.25s, duration 0.45s)
 *   t=0.80s    → Line 3
 *   t=1.05s    → Line 4 (ends ≈ t=1.50s — total title phase ≈ 1.2s)
 *   t=1.50s    → Sketch underline pathLength animate (1.2s)
 *   t=2.70s    → Post-sketch items: body → USP → CTAs → trust bullets → mobile pills
 *                 (each spaced 0.15s, duration 0.55s — "tốc độ cũ")
 *
 * Reduced-motion: components call useReducedMotion(), pass initial="visible"
 * to mount at final state instantly (no transforms).
 */

import type { Variants } from 'framer-motion';

const EASE_OUT: [number, number, number, number] = [0.2, 0, 0, 1];

// ---------------------------------------------------------------------------
// Phase 1 — Eyebrow (t=0 → 0.3s)
// ---------------------------------------------------------------------------

export const heroEyebrowVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE_OUT, delay: 0 },
  },
};

// ---------------------------------------------------------------------------
// Phase 2 — Title 4 lines (t=0.3 → 2.0s)
// ---------------------------------------------------------------------------

/** Title container: stagger 4 lines starting at t=0.3 (after eyebrow). */
export const headlineWordContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.3, staggerChildren: 0.25 },
  },
};

/** Each title line: fade-up + blur clear (0.45s) — tightened cadence. */
export const headlineWordItemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: EASE_OUT },
  },
};

// ---------------------------------------------------------------------------
// Phase 4 — Post-sketch items (t=3.2s onward) — fade-in tốc độ cũ
// (Phase 3 = sketch underline animates inside SketchUnderline component
//  at delay=2.0s for 1.2s duration → completes ≈ t=3.2s.)
// ---------------------------------------------------------------------------

const POST_SKETCH_BASE = 2.7;
const POST_SKETCH_STEP = 0.15;
const POST_SKETCH_DURATION = 0.55;

/** Hero body paragraph */
export const heroBodyVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: POST_SKETCH_DURATION, ease: EASE_OUT, delay: POST_SKETCH_BASE },
  },
};

/** USP Close note block */
export const heroUspVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: POST_SKETCH_DURATION,
      ease: EASE_OUT,
      delay: POST_SKETCH_BASE + POST_SKETCH_STEP,
    },
  },
};

/** CTA buttons row */
export const heroCtaVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: POST_SKETCH_DURATION,
      ease: EASE_OUT,
      delay: POST_SKETCH_BASE + POST_SKETCH_STEP * 2,
    },
  },
};

/** Trust bullets container — stagger bullets after CTAs visible */
export const heroTrustContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: POST_SKETCH_BASE + POST_SKETCH_STEP * 3,
      staggerChildren: 0.1,
    },
  },
};

/** Mobile pills row (D5) */
export const heroPillsVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: POST_SKETCH_DURATION,
      ease: EASE_OUT,
      delay: POST_SKETCH_BASE + POST_SKETCH_STEP * 4,
    },
  },
};

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

/** Parent shell — propagates animate state, no orchestration of its own. */
export const heroContainerVariants: Variants = {
  hidden: {},
  visible: {},
};

/** Photo panel — keep opacity:1 always for LCP correctness, animate scale only.
    Removing opacity:0 initial prevents Next.js LCP "loading=eager missing" warning
    (photo paints immediately, scale subtly settles in 0.65s). */
export const heroPhotoVariants: Variants = {
  // Simple fade-in only. Keep this intentionally subtle for LCP-sensitive hero media.
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.55, ease: EASE_OUT, delay: 0.12 },
  },
};


/** D7 viewport stagger item — used by trust bullets + about bullets. */
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_OUT },
  },
};

/** Legacy alias — kept for `heroContentVariants` callers (About section etc.) */
export const heroContentVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

/** Instant variant — useReducedMotion path, mount at final state. */
export const instantVariants: Variants = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } },
  instant: { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } },
};
