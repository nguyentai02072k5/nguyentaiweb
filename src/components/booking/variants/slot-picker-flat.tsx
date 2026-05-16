/**
 * Variant B: Flat list ordered by time.
 * Pros: compact, ít cuộn, dễ scan theo thứ tự thời gian.
 * Cons: ít cảm giác "morning/evening" — phải đọc period tag.
 */

'use client';

import { useState } from 'react';
import { SlotButton } from '@/components/booking/foundation/slot-button';
import { BookingProgress } from '@/components/booking/foundation/booking-progress';
import { MOCK_SLOTS } from '@/components/booking/_mock-data';

export function SlotPickerFlat() {
  const [selected, setSelected] = useState<string | null>(null);

  const sorted = [...MOCK_SLOTS].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">Chọn Giờ - T6 15/05</h3>
        <BookingProgress current={2} total={4} className="hidden sm:flex max-w-[200px]" />
      </div>
      <BookingProgress current={2} total={4} className="sm:hidden mb-4" />

      <div className="space-y-2">
        {sorted.map((s) => (
          <SlotButton
            key={s.iso}
            slot={s}
            selected={selected === s.iso}
            onSelect={setSelected}
            layout="row"
          />
        ))}
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
