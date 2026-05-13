"use client";

/**
 * sketch-lines.tsx - SVG sketch line decoration (Layer 5, F1 style).
 *
 * One-shot CSS animation reveal on mount (stroke-dashoffset draw-in).
 * Reduced-motion: lines shown static immediately (no animation).
 * Not looped - pathLength animation stops after mount.
 *
 * GPU-only: uses stroke-dashoffset (compositor-eligible via opacity).
 * will-change applied only during animation, removed after via CSS.
 */

export function SketchLines() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12]"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1440 800"
    >
      <style>{`
        @keyframes sketch-draw {
          from { stroke-dashoffset: 600; }
          to   { stroke-dashoffset: 0; }
        }

        .sketch-line {
          stroke-dasharray: 600;
          stroke-dashoffset: 0;
          animation: sketch-draw 1.2s ease-out forwards;
        }

        /* Reduced-motion: show full path immediately, no animation */
        @media (prefers-reduced-motion: reduce) {
          .sketch-line {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      {/* Diagonal accent line - top-left corner */}
      <line
        className="sketch-line"
        x1="0" y1="120"
        x2="280" y2="0"
        stroke="#6366f1"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ animationDelay: '0.1s' }}
      />

      {/* Curved arc - right side, decorative */}
      <path
        className="sketch-line"
        d="M 1320 0 Q 1480 200 1380 420"
        fill="none"
        stroke="#a855f7"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={{ animationDelay: '0.25s' }}
      />

      {/* Small diagonal - bottom left */}
      <line
        className="sketch-line"
        x1="60" y1="680"
        x2="200" y2="760"
        stroke="#ec4899"
        strokeWidth="1"
        strokeLinecap="round"
        style={{ animationDelay: '0.4s' }}
      />
    </svg>
  );
}
