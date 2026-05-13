"use client";

/**
 * hero-aurora-bg.tsx - 6-layer Aurora background for Hero section.
 *
 * Layer stack (bottom to top):
 *   1. Base #FAF7FF solid - always present, CLS=0
 *   2. Aurora blobs (A6) - 3 desktop / 1-2 mobile (D8 mobile tier)
 *   3. Silk shimmer (A5) - desktop only, disabled mobile + reduced-motion
 *   4. Dot grid pattern - static, always present
 *   5. Sketch lines (F1) - one-shot reveal, static on reduced-motion
 *   6. Bottom gradient fade - always present
 *
 * Reduced-motion matrix:
 *   A5 silk shimmer  → DISABLED (no element rendered)
 *   A6 aurora drift  → STATIC positions (animation paused via CSS)
 *   Blobs            → Static (animation-play-state: paused via prefers-reduced-motion in globals.css)
 */

import { SketchLines } from './sketch-lines';
import { DotPattern } from './dot-pattern';

export function HeroAuroraBg() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Layer 1: Base cream-violet - always solid, no flicker */}
      <div className="absolute inset-0 bg-surface-base" />

      {/* Layer 2: Aurora blobs - softer alpha, contained near content,
          no bottom-leak that creates visible band against About section. */}
      {/* Blob A - top-left indigo/violet */}
      <div
        className="
          absolute -top-24 -left-24 w-[440px] h-[440px] rounded-full
          bg-[radial-gradient(circle,rgba(99,102,241,0.18)_0%,transparent_72%)]
          animate-blob-1 will-change-transform
        "
      />
      {/* Blob B - top-right pink (desktop only) */}
      <div
        className="
          absolute -top-16 right-0 w-[360px] h-[360px] rounded-full
          bg-[radial-gradient(circle,rgba(236,72,153,0.14)_0%,transparent_72%)]
          animate-blob-2 will-change-transform
          hidden sm:block
        "
      />
      {/* Blob C - mid-right violet (desktop only, NO bottom leak) */}
      <div
        className="
          absolute top-1/3 right-1/4 w-[420px] h-[260px] rounded-full
          bg-[radial-gradient(ellipse,rgba(168,85,247,0.12)_0%,rgba(6,182,212,0.06)_50%,transparent_80%)]
          animate-blob-3 will-change-transform
          hidden md:block
        "
      />

      {/* Layer 3: Silk shimmer - desktop only, disabled on mobile + reduced-motion */}
      <div
        className="
          absolute inset-0 pointer-events-none
          hidden md:block
          motion-reduce:hidden
        "
      >
        <div
          className="
            absolute top-0 left-0 w-1/2 h-full
            bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.3)_50%,transparent_70%)]
            animate-silk-shimmer
          "
        />
      </div>

      {/* Layer 4: Dot grid pattern */}
      <DotPattern />

      {/* Layer 5: Sketch lines - one-shot SVG reveal */}
      <SketchLines />

      {/* Layer 6: removed - bottom fade was creating a visible violet band that
          ngăn cách Hero / About. Aurora blobs đã tự fade tự nhiên. */}
    </div>
  );
}
