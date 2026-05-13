/**
 * dot-pattern.tsx - Static SVG dot grid overlay for Hero background (Layer 4).
 *
 * Pure decorative - aria-hidden. CSS-only, zero JS, zero animation.
 * SVG pattern tile: 24×24px grid, dots at center of each cell.
 * Opacity low enough to not compete with body text contrast.
 */

export function DotPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full opacity-[0.35] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="dot-grid"
          x="0"
          y="0"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="12" cy="12" r="1.2" fill="#a855f7" fillOpacity="0.45" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
    </svg>
  );
}
