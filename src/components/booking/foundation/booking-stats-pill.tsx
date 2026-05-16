'use client';

import { Sparkles } from 'lucide-react';
import { useDays } from '@/lib/booking/use-availability';

export function BookingStatsPill() {
  const { stats } = useDays();

  return (
    <div className="inline-flex items-center gap-4 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-border-default text-[12px] text-text-secondary">
      {stats && stats.recent_bookings_24h > 0 && (
        <>
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-brand-violet" strokeWidth={2.4} />
            <span className="font-semibold tabular-nums text-text-primary">
              {stats.recent_bookings_24h}
            </span>
            <span>người vừa đặt</span>
            <span className="text-text-tertiary">/ 24h</span>
          </span>
          <span className="text-border-strong">·</span>
        </>
      )}
      <span className="flex items-center gap-1.5">
        <span className="font-semibold tabular-nums text-text-primary">
          {stats ? stats.total_available : '…'}
        </span>
        <span>slot trống</span>
        <span className="text-text-tertiary">/ 7 ngày</span>
      </span>
    </div>
  );
}
