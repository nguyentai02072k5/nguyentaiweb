/**
 * mooly-progress.tsx - Thanh tiến độ form Mooly dạng PILL BAR phân đoạn.
 *
 * Mỗi mục bắt buộc = 1 pill: điền xong → sáng (aurora), chưa điền → mờ. Pill kế
 * tiếp cần điền nhấp nháy nhẹ để dẫn hướng. Đạt 100% → toàn bộ chuyển emerald +
 * tick (endowed progress + Zeigarnik). Sticky trên đầu form khi cuộn.
 */

'use client';

import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MoolyProgress({ filled, total }: { filled: number; total: number }) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.round((Math.min(filled, safeTotal) / safeTotal) * 100);
  const complete = filled >= safeTotal;

  return (
    <div className="sticky top-2 z-20 mb-5 rounded-full border border-border-default bg-white/80 px-4 py-2.5 shadow-md backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between gap-2 text-[12px] font-semibold">
        <span className={cn('inline-flex items-center gap-1.5', complete ? 'text-emerald-600' : 'text-text-secondary')}>
          {complete && <CheckCircle2 className="size-4" />}
          {complete ? 'Đã đủ thông tin — sẵn sàng gửi!' : 'Mức độ hoàn thành'}
        </span>
        <span className="shrink-0 tabular-nums">
          <span className={complete ? 'text-emerald-600' : 'text-brand-violet'}>{Math.min(filled, safeTotal)}</span>
          <span className="text-text-tertiary">/{safeTotal} mục · {pct}%</span>
        </span>
      </div>

      {/* Dãy pill phân đoạn */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: safeTotal }, (_, i) => {
          const isFilled = i < filled;
          const isNext = i === filled && !complete;
          return (
            <span
              key={i}
              className={cn(
                'h-2 flex-1 rounded-full transition-all duration-500 ease-out',
                isFilled
                  ? complete
                    ? 'bg-emerald-500'
                    : 'bg-aurora'
                  : isNext
                    ? 'bg-brand-violet/30 animate-pulse'
                    : 'bg-surface-subtle',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
