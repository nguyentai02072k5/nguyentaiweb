/**
 * Variant B: Compact week grid (no scrolling).
 * 7 ngày trong 3 hàng (4-3 layout) — tất cả visible một lúc.
 * Pros: thấy hết, không scroll, ít cognitive load.
 * Cons: chip nhỏ hơn, ít "play" feel.
 */

'use client';

import { useState } from 'react';
import { DayChip } from '@/components/booking/foundation/day-chip';
import { BookingProgress } from '@/components/booking/foundation/booking-progress';
import { MOCK_DAYS } from '@/components/booking/_mock-data';

export function DatePickerGrid() {
  const [selected, setSelected] = useState(MOCK_DAYS[0].date);

  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">Chọn Ngày Phù Hợp</h3>
        <BookingProgress current={1} total={4} className="hidden sm:flex max-w-[200px]" />
      </div>

      <BookingProgress current={1} total={4} className="sm:hidden mb-4" />

      <div className="grid grid-cols-4 gap-2.5">
        {MOCK_DAYS.map((day) => (
          <DayChip
            key={day.date}
            day={day}
            selected={selected === day.date}
            onSelect={setSelected}
            variant="grid"
          />
        ))}
      </div>

      <p className="mt-4 text-xs text-text-tertiary text-center">
        Tất cả ngày visible — không cần cuộn
      </p>
    </div>
  );
}
