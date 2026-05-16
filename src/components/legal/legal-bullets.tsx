/**
 * legal-bullets.tsx — Aurora-styled bullet list for /privacy & /terms.
 *
 * Default marker: ✦ (Aurora violet, matches About + ProcessJourney bullets).
 * Optional `marker` prop accepts any string (e.g. ❌, ✅) for negative/positive
 * lists. Items can be plain string or ReactNode for richer formatting.
 */

import { cn } from '@/lib/utils';

type LegalBulletsProps = {
  items: React.ReactNode[];
  marker?: string;
  markerClassName?: string;
};

export function LegalBullets({
  items,
  marker = '✦',
  markerClassName,
}: LegalBulletsProps) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 font-body text-body-lg text-text-secondary leading-relaxed"
        >
          <span
            aria-hidden="true"
            className={cn(
              'shrink-0 mt-1 font-bold text-sm text-brand-violet',
              markerClassName,
            )}
          >
            {marker}
          </span>
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
}
