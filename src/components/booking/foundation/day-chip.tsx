/**
 * DayChip — one day card in the date picker.
 * Touch target ≥ 48px (mobile-first). Three states: default / selected / disabled.
 */

'use client';

import { cn } from '@/lib/utils';
import type { DayAvailability } from '@/lib/booking/types';

export type DayChipProps = {
  day: DayAvailability;
  selected?: boolean;
  onSelect?: (date: string) => void;
  variant?: 'chip' | 'grid';
};

export function DayChip({ day, selected, onSelect, variant = 'chip' }: DayChipProps) {
  const disabled = day.availableCount === 0;
  const isChip = variant === 'chip';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.(day.date)}
      aria-pressed={selected}
      className={cn(
        'group relative flex flex-col items-center justify-center rounded-xl border transition-all',
        isChip
          ? 'min-w-[88px] px-4 py-3 snap-start'
          : 'aspect-square w-full p-2 min-h-[88px]',
        disabled && 'cursor-not-allowed opacity-40',
        !disabled && !selected && 'border-border-default bg-surface-elevated hover:border-brand-violet/50 hover:shadow-sm active:scale-[0.98]',
        !disabled && selected && 'border-brand-violet bg-violet-50 shadow-md ring-2 ring-brand-violet/20',
        day.isToday && !selected && 'border-brand-indigo/30',
      )}
    >
      {day.isToday && (
        <span className="absolute top-1 right-2 text-[10px] font-display uppercase tracking-wide text-brand-indigo">
          Hôm nay
        </span>
      )}
      <span className="font-display text-xs uppercase text-text-tertiary">
        {day.label.split(' ')[0]}
      </span>
      <span className={cn(
        'font-display text-2xl font-bold leading-tight',
        selected ? 'text-aurora' : 'text-text-primary',
      )}>
        {day.label.split(' ')[1]}
      </span>
      <span className={cn(
        'text-[11px] mt-0.5',
        disabled ? 'text-text-tertiary' : day.availableCount <= 3 ? 'text-brand-pink' : 'text-text-secondary',
      )}>
        {disabled ? 'Hết slot' : `Còn ${day.availableCount}`}
      </span>
    </button>
  );
}
