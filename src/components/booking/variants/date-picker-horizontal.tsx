/**
 * Variant A: Horizontal scroll chips (per phase 06 plan).
 * Mobile-first: swipe trái-phải, scroll-snap-x mandatory.
 * Pros: cảm giác "schedule strip", tap nhanh.
 * Cons: phải scroll thấy ngày xa.
 */

'use client';

import { useState } from 'react';
import { DayChip } from '@/components/booking/foundation/day-chip';
import { BookingProgress } from '@/components/booking/foundation/booking-progress';
import { MOCK_DAYS } from '@/components/booking/_mock-data';

export function DatePickerHorizontal() {
  const [selected, setSelected] = useState(MOCK_DAYS[0].date);

  return (
    <div className="rounded-2xl border border-border-default bg-surface-elevated p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">Chọn Ngày Phù Hợp</h3>
        <BookingProgress current={1} total={4} className="hidden sm:flex max-w-[200px]" />
      </div>

      <BookingProgress current={1} total={4} className="sm:hidden mb-4" />

      <div className="-mx-5 px-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        <div className="flex gap-2.5 pb-2">
          {MOCK_DAYS.map((day) => (
            <DayChip
              key={day.date}
              day={day}
              selected={selected === day.date}
              onSelect={setSelected}
              variant="chip"
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-text-tertiary text-center">
        Vuốt sang ngang để xem thêm ngày →
      </p>
    </div>
  );
}
