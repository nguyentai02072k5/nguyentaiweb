/**
 * BookingProgress — stepper with current step indicator.
 * Used by all variants to show "Bước X/Y".
 */

import { cn } from '@/lib/utils';

export type BookingProgressProps = {
  current: number;
  total: number;
  className?: string;
};

export function BookingProgress({ current, total, className }: BookingProgressProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="font-display text-label uppercase tracking-wider text-brand-violet">
        Bước {current}/{total}
      </span>
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i < current ? 'bg-brand-violet' : 'bg-border-default',
            )}
          />
        ))}
      </div>
    </div>
  );
}
