/**
 * Typography tokens - fluid clamp-based type scale.
 * Mirrors CSS --text-* tokens in globals.css for JS/TS access.
 */

export const fontFamilies = {
  display: "var(--font-plus-jakarta-sans), system-ui, sans-serif",
  body: "var(--font-be-vietnam-pro), system-ui, sans-serif",
  mono: 'ui-monospace, "SF Mono", "JetBrains Mono", monospace',
} as const;

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

/**
 * Type scale with fluid clamp values (responsive without breakpoints).
 * `size` = font-size CSS value · `lh` = line-height · `weight` = numeric weight
 */
export const typeScale = {
  display1: {
    size: "clamp(2.5rem, 8vw, 5rem)",
    lh: 1.05,
    weight: fontWeights.extrabold,
    letterSpacing: "-0.03em",
  },
  display2: {
    size: "clamp(2rem, 6vw, 3.5rem)",
    lh: 1.1,
    weight: fontWeights.bold,
    letterSpacing: "-0.02em",
  },
  h1: {
    size: "clamp(1.75rem, 4vw, 2.5rem)",
    lh: 1.2,
    weight: fontWeights.bold,
    letterSpacing: "-0.01em",
  },
  h2: {
    size: "clamp(1.5rem, 3.5vw, 2rem)",
    lh: 1.25,
    weight: fontWeights.semibold,
    letterSpacing: "-0.005em",
  },
  bodyLg: {
    size: "1.125rem",
    lh: 1.6,
    weight: fontWeights.normal,
    letterSpacing: "0",
  },
  body: {
    size: "1rem",
    lh: 1.6,
    weight: fontWeights.normal,
    letterSpacing: "0",
  },
  bodySm: {
    size: "0.875rem",
    lh: 1.5,
    weight: fontWeights.normal,
    letterSpacing: "0",
  },
  label: {
    size: "0.875rem",
    lh: 1.4,
    weight: fontWeights.semibold,
    letterSpacing: "0.01em",
  },
} as const;

export type TypeScaleKey = keyof typeof typeScale;
