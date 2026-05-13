/**
 * Layer 2 - Semantic design tokens (Aurora Glow palette).
 * Light base · vibrant aurora · neon glow accents.
 * Source of truth - CSS @theme block in globals.css mirrors these values.
 */

export const semanticColors = {
  brand: {
    indigo: "#6366F1",       // primary CTA, links
    indigoDeep: "#4F46E5",   // active/pressed
    violet: "#A855F7",       // vibrant accent
    violetSoft: "#C084FC",   // soft highlight
    pink: "#EC4899",         // pop accent (CTA glow, badges)
    cyan: "#06B6D4",         // fresh accent (less common)
  },
  surface: {
    base: "#FAF7FF",         // cream-violet - page bg
    elevated: "#FFFFFF",     // cards, modals
    subtle: "#F2EDFA",       // alternation
    glass: "rgba(255, 255, 255, 0.6)", // frosted backdrop
    inverse: "#15152A",      // dark sections
  },
  text: {
    primary: "#1A1A2E",      // deep navy-violet
    secondary: "#52527A",
    tertiary: "#9CA0C0",
    onBrand: "#FFFFFF",
    onGlass: "#1A1A2E",
  },
  border: {
    default: "#EBE7F2",      // soft lavender
    strong: "#D4CCE6",
    glow: "#A855F7",
  },
} as const;

export const gradients = {
  aurora: "linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)",
  auroraSoft: "linear-gradient(135deg, #818CF8 0%, #C084FC 50%, #F0ABFC 100%)",
  auroraCool: "linear-gradient(135deg, #06B6D4 0%, #6366F1 50%, #A855F7 100%)",
  textAurora: "linear-gradient(90deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)",
  meshAurora: [
    "radial-gradient(at 15% 20%, rgba(168, 85, 247, 0.35) 0%, transparent 50%)",
    "radial-gradient(at 85% 30%, rgba(236, 72, 153, 0.28) 0%, transparent 50%)",
    "radial-gradient(at 50% 80%, rgba(99, 102, 241, 0.32) 0%, transparent 50%)",
    "radial-gradient(at 75% 70%, rgba(6, 182, 212, 0.22) 0%, transparent 50%)",
  ].join(", "),
} as const;

export const shadows = {
  sm: "0 2px 4px rgba(99, 102, 241, 0.06)",
  md: "0 8px 24px rgba(99, 102, 241, 0.08)",
  lg: "0 24px 60px rgba(99, 102, 241, 0.12)",
  card: "0 4px 16px rgba(99, 102, 241, 0.05), 0 1px 4px rgba(99, 102, 241, 0.04)",
  glowViolet: "0 0 48px rgba(168, 85, 247, 0.45), 0 0 16px rgba(168, 85, 247, 0.3)",
  glowPink: "0 0 40px rgba(236, 72, 153, 0.4), 0 0 14px rgba(236, 72, 153, 0.3)",
  glowIndigo: "0 0 40px rgba(99, 102, 241, 0.4), 0 0 14px rgba(99, 102, 241, 0.3)",
  glowCyan: "0 0 32px rgba(6, 182, 212, 0.35)",
} as const;

export const radius = {
  xs: "6px",
  sm: "10px",
  md: "14px",
  lg: "20px",
  xl: "28px",
  "2xl": "40px",
  full: "9999px",
} as const;
