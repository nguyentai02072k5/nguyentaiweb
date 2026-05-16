/**
 * Variant A: Slots grouped by time-of-day with emoji headers.
 * Pros: scannable, emoji giúp định vị nhanh sáng/chiều/tối.
 * Cons: nhiều header → tốn vertical space.
 */

'use client';

import { useState } from 'react';
import { SlotButton } from '@/components/booking/foundation/slot-button';
import { BookingProgress } from '@/components/booking/foundation/booking-progress';
import { MOCK_SLOTS, PERIOD_META } from '@/components/booking/_mock-data';
import type { Slot, TimePeriod } from '@/lib/booking/types';

const PERIOD_ORDER: TimePeriod[] = ['morning', 'midday', 'afternoon', 'evening', 'night'];

export function SlotPickerGrouped() {
  const [selected, setSelected] = useState<string | null>(null);

  const groups = new Map<TimePeriod, Slot[]>();
  for (const slot of MOCK_SLOTS) {
    const list = groups.get(slot.period) ?? [];
    list.push(slot);
    groups.set(slot.period, list);
  }

  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">Chọn Giờ - T6 15/05</h3>
        <BookingProgress current={2} total={4} className="hidden sm:flex max-w-[200px]" />
      </div>
      <BookingProgress current={2} total={4} className="sm:hidden mb-4" />

      <div className="space-y-4">
        {PERIOD_ORDER.map((period) => {
          const slots = groups.get(period);
          if (!slots || slots.length === 0) return null;
          const meta = PERIOD_META[period];
          return (
            <div key={period}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{meta.emoji}</span>
                <span className="font-display text-sm font-semibold uppercase tracking-wide text-text-secondary">
                  {meta.label}
                </span>
                <div className="flex-1 h-px bg-border-default" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {slots.map((s) => (
                  <SlotButton
                    key={s.iso}
                    slot={s}
                    selected={selected === s.iso}
                    onSelect={setSelected}
                    layout="card"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-4 w-full text-sm text-brand-violet hover:text-brand-violet-soft font-display"
      >
        Xem thêm giờ khác →
      </button>
    </div>
  );
}
