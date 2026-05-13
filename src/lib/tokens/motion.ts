/**
 * Motion tokens - durations, easings, springs.
 * Numeric values for Framer Motion (seconds-based) + ms-based for CSS.
 * Mirrors CSS --duration-* and --ease-* tokens in globals.css.
 */

/** Duration in seconds (Framer Motion native unit) */
export const durationSec = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  epic: 0.7,
} as const;

/** Duration in milliseconds (CSS / setTimeout unit) */
export const durationMs = {
  fast: 150,
  base: 250,
  slow: 400,
  epic: 700,
} as const;

/** Cubic bezier coefficients (Framer Motion accepts as `ease` array prop) */
export const ease = {
  standard: [0.2, 0, 0, 1] as const,         // Material standard - most common
  emphasized: [0.4, 0, 0.2, 1] as const,     // Stronger acceleration
  bounce: [0.34, 1.56, 0.64, 1] as const,    // Overshoot bounce
} as const;

/** Spring configs (Framer Motion `transition: { type: "spring", ... }`) */
export const springs = {
  smooth: { type: "spring", stiffness: 120, damping: 20 } as const,
  bouncy: { type: "spring", stiffness: 400, damping: 14 } as const,
  stiff: { type: "spring", stiffness: 300, damping: 30 } as const,
  gentle: { type: "spring", stiffness: 80, damping: 18 } as const,
} as const;

/** Reusable transition presets for entrance animations */
export const transitions = {
  fadeIn: {
    duration: durationSec.base,
    ease: ease.standard,
  },
  slideUp: {
    duration: durationSec.slow,
    ease: ease.standard,
  },
  pop: {
    ...springs.bouncy,
  },
} as const;
