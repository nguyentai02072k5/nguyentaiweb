/**
 * mobile-pills.tsx - Mobile-only inline trust pills row (D5 synthesis).
 *
 * Replaces floating badges on mobile where absolute positioning is impractical.
 * Displays as horizontal scrollable row of chips with icon + label.
 *
 * Visibility: flex on mobile (< md), hidden on desktop (md:hidden).
 * Animation: viewport stagger 100ms per pill (disabled on reduced-motion).
 * Touch target: 36px min-height (pill height), full pill is tappable but non-interactive.
 */

import type { TrustBadge } from '@/content/landing';

type MobilePillsProps = {
  pills: readonly TrustBadge[];
};

export function MobilePills({ pills }: MobilePillsProps) {
  return (
    <div
      className="flex md:hidden flex-wrap gap-2 mt-6"
      aria-label="Điểm nổi bật"
    >
      {pills.map((pill, i) => (
        <span
          key={pill.label}
          className="
            inline-flex items-center gap-1.5
            rounded-full
            bg-white
            border border-brand-indigo/20
            px-3 py-1.5
            font-display text-xs font-semibold text-text-primary
            shadow-sm
            motion-safe:animate-[fadeInUp_0.4s_ease_forwards]
            opacity-0
          "
          style={{
            animationDelay: `${i * 100}ms`,
            animationFillMode: 'forwards',
          }}
          aria-label={pill.label}
        >
          <span role="img" aria-hidden="true" className="text-sm leading-none">
            {pill.icon}
          </span>
          {pill.label}
        </span>
      ))}
    </div>
  );
}
