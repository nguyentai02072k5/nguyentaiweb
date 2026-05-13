/**
 * floating-badge.tsx - Desktop-only floating trust badge around hero photo.
 *
 * Carries semantic content (trust signals), so NOT aria-hidden.
 * Positioned absolutely relative to photo container via className prop.
 * Animation: gentle float-y loop (disabled on reduced-motion via globals.css).
 */

import type { TrustBadge } from '@/content/landing';

type FloatingBadgeProps = {
  badge: TrustBadge;
  /** Tailwind positioning classes e.g. "-top-4 -left-8" */
  className?: string;
  /** Stagger delay for float animation */
  animationDelay?: string;
};

export function FloatingBadge({ badge, className = '', animationDelay = '0s' }: FloatingBadgeProps) {
  return (
    <div
      className={`
        absolute z-10
        flex items-center gap-2
        rounded-full bg-white/90 backdrop-blur-sm
        border border-border-default shadow-card
        px-3 py-1.5
        font-display text-xs font-semibold text-text-primary
        animate-float-y motion-reduce:animate-none
        ${className}
      `}
      style={{ animationDelay }}
      aria-label={badge.label}
    >
      <span role="img" aria-hidden="true" className="text-sm leading-none">
        {badge.icon}
      </span>
      <span>{badge.label}</span>
    </div>
  );
}
