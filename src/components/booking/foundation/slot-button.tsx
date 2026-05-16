/**
 * SlotButton — one time slot button.
 * Touch target ≥ 48px. Shows time large + period hint + availability state.
 */

'use client';

import { cn } from '@/lib/utils';
import type { Slot } from '@/lib/booking/types';
import { PERIOD_META } from '@/components/booking/_mock-data';

export type SlotButtonProps = {
  slot: Slot;
  selected?: boolean;
  onSelect?: (iso: string) => void;
  showPeriodTag?: boolean;
  layout?: 'card' | 'row';
};

export function SlotButton({
  slot,
  selected,
  onSelect,
  showPeriodTag = false,
  layout = 'card',
}: SlotButtonProps) {
  const meta = PERIOD_META[slot.period];
  const disabled = !slot.available;
  const isRow = layout === 'row';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.(slot.iso)}
      aria-pressed={selected}
      className={cn(
        'group relative flex items-center justify-center rounded-xl border font-display transition-all',
        isRow ? 'w-full min-h-[52px] px-4 py-2 justify-between' : 'min-h-[64px] px-4 py-3 flex-col gap-1',
        disabled && 'cursor-not-allowed opacity-40 line-through',
        !disabled && !selected && 'border-border-default bg-surface-elevated hover:border-brand-violet/60 hover:shadow-sm active:scale-[0.98]',
        !disabled && selected && 'border-brand-violet bg-violet-50 shadow-md ring-2 ring-brand-violet/20',
      )}
    >
      {isRow ? (
        <>
          <span className={cn('text-lg font-semibold', selected && 'text-aurora')}>{slot.time}</span>
          <span className="text-xs text-text-secondary flex items-center gap-1">
            <span>{meta.emoji}</span>
            <span>{meta.label}</span>
            {disabled && <span className="text-brand-pink ml-1">Đã đặt</span>}
          </span>
        </>
      ) : (
        <>
          <span className="text-base leading-none">{meta.emoji}</span>
          <span className={cn('text-xl font-bold leading-tight', selected && 'text-aurora')}>
            {slot.time}
          </span>
          {showPeriodTag && (
            <span className="text-[10px] uppercase tracking-wide text-text-tertiary">
              {meta.label}
            </span>
          )}
          {disabled && (
            <span className="text-[10px] text-brand-pink font-normal normal-case">
              Đã đặt
            </span>
          )}
        </>
      )}
    </button>
  );
}
