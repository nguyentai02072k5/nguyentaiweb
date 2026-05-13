"use client";

/**
 * sticky-cta-bar.tsx - Phase 03b Mobile Sticky CTA bar.
 *
 * Behavior (synthesis D2 + D9):
 *   • Mobile-only (md:hidden) - desktop already has Hero primary CTA + nav
 *   • Show: after Hero scrolls out of viewport (intersection threshold 0)
 *   • Hide: when Booking section enters viewport (threshold 0.1)
 *     - If #booking does not exist yet (pre Phase 06), sticky keeps showing
 *       - graceful degradation while landing page builds out.
 *   • No dismiss button v1 (conversion priority - owner decision 2026-05-12)
 *   • Smooth scroll to #booking on tap
 *
 * Style:
 *   • Full-width aurora gradient bottom bar (~56px height)
 *   • Animated entrance: translateY 100% → 0 (300ms ease-out)
 *   • Glow shadow lifts the bar visually
 *   • Sketch arrow F1 → after text, slight nudge on tap
 *
 * Reduced-motion (D7):
 *   • Slide-in/out → instant show/hide (no transition)
 *   • E1 shine sweep → disabled
 *   • Tap feedback → opacity flash only (no scale)
 *
 * A11y:
 *   • aria-hidden when not shown
 *   • aria-label carries the full verb-led description from LANDING schema
 *   • Touch target = 56px height (well above 48px guideline)
 *   • safe-area-inset-bottom respect for iPhone notched home indicator
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { StickyCtaContent } from '@/content/landing';
import { trackCtaClick } from '@/lib/analytics/track-cta-click';
import { useSectionInView } from '@/hooks/use-section-in-view';

type StickyCtaBarProps = {
  content: StickyCtaContent;
};

const HERO_INTERSECTION_OPTIONS = { threshold: 0 } satisfies IntersectionObserverInit;
const BOOKING_INTERSECTION_OPTIONS = { threshold: 0.1 } satisfies IntersectionObserverInit;

export function StickyCtaBar({ content }: StickyCtaBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const heroVisible = useSectionInView(
    content.showAfterAnchor,
    HERO_INTERSECTION_OPTIONS,
  );
  const bookingVisible = useSectionInView(
    content.hideAtAnchor,
    BOOKING_INTERSECTION_OPTIONS,
  );

  // Show when Hero is OUT of viewport AND Booking is NOT (yet) in viewport.
  // If Booking section does not exist, bookingVisible stays false → sticky keeps showing.
  const shouldShow = !heroVisible && !bookingVisible;

  return (
    <div
      aria-hidden={!shouldShow}
      data-show={shouldShow}
      className={`
        fixed inset-x-0 bottom-0 z-40
        md:hidden
        pb-[env(safe-area-inset-bottom)]
        ${shouldReduceMotion ? '' : 'transition-transform duration-300 ease-out'}
        ${shouldShow ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      <a
        href={content.cta.href}
        aria-label={content.cta.ariaLabel}
        data-cta-location={content.cta.analyticsId}
        onClick={() => trackCtaClick(content.cta.analyticsId)}
        tabIndex={shouldShow ? 0 : -1}
        className="
          group relative overflow-hidden
          flex items-center justify-center gap-2
          w-full
          px-5 py-4 min-h-[56px]
          bg-aurora
          shadow-[0_-8px_32px_-8px_rgba(168,85,247,0.45)]
          font-display font-semibold text-text-on-brand text-[15px]
          active:opacity-90 active:scale-[0.98]
          motion-reduce:active:scale-100
          transition-transform duration-150
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-inset
        "
      >
        {/* E1 shine sweep - subtle loading cue, Framer Motion controlled
            - Sweep duration: 3.2s (≤ 4s spec)
            - Trajectory: enters from left, crosses the CTA, exits fully to the right
            - Opacity arc: soft fade in, visible sweep, then fade out before exit
            - Rest gap: 10s after each cycle (repeatDelay)
            - Reduced-motion: rendered invisible, no animation */}
        <motion.span
          aria-hidden="true"
          className="
            absolute inset-y-0 -left-1/4 w-1/4
            bg-[linear-gradient(120deg,transparent_28%,rgba(255,255,255,0.28)_50%,transparent_72%)]
            pointer-events-none
            motion-reduce:hidden
          "
          initial={{ x: '-100%', opacity: 0 }}
          animate={
            shouldReduceMotion || !shouldShow
              ? { x: '-100%', opacity: 0 }
              : {
                  x: ['-100%', '60%', '310%', '500%'],
                  opacity: [0, 0.72, 0.56, 0],
                }
          }
          transition={{
            duration: 3.2,
            times: [0, 0.16, 0.72, 1],
            ease: [0.22, 1, 0.36, 1],
            repeat: Infinity,
            repeatDelay: 10,
          }}
        />
        <span className="relative z-10 flex items-center gap-2">
          {content.cta.label}
        </span>
      </a>
    </div>
  );
}
