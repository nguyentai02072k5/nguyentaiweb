/**
 * _mock-data.ts — Static fake data for /booking preview ONLY.
 * Production routes use real API.
 */

import type { DayAvailability, Slot } from '@/lib/booking/types';

export const MOCK_DAYS: DayAvailability[] = [
  { date: '2026-05-14', dayOfWeek: 4, label: 'T5 14/05', isToday: true,  availableCount: 12 },
  { date: '2026-05-15', dayOfWeek: 5, label: 'T6 15/05', isToday: false, availableCount: 18 },
  { date: '2026-05-16', dayOfWeek: 6, label: 'T7 16/05', isToday: false, availableCount: 24 },
  { date: '2026-05-17', dayOfWeek: 0, label: 'CN 17/05', isToday: false, availableCount: 22 },
  { date: '2026-05-18', dayOfWeek: 1, label: 'T2 18/05', isToday: false, availableCount: 16 },
  { date: '2026-05-19', dayOfWeek: 2, label: 'T3 19/05', isToday: false, availableCount: 20 },
  { date: '2026-05-20', dayOfWeek: 3, label: 'T4 20/05', isToday: false, availableCount: 0  },
];

// Curated subset for legacy B1/B2 variants — 8 representative slots within
// working windows 09:00-11:30 + 14:00-19:30 (LOCKED 2026-05-15).
export const MOCK_SLOTS: Slot[] = [
  { time: '09:00', iso: '2026-05-15T02:00:00Z', available: true,  period: 'morning'   },
  { time: '10:30', iso: '2026-05-15T03:30:00Z', available: false, period: 'morning',   reason: 'blocked-by-booking' },
  { time: '11:30', iso: '2026-05-15T04:30:00Z', available: true,  period: 'midday'    },
  { time: '14:00', iso: '2026-05-15T07:00:00Z', available: true,  period: 'afternoon' },
  { time: '16:00', iso: '2026-05-15T09:00:00Z', available: true,  period: 'afternoon' },
  { time: '16:30', iso: '2026-05-15T09:30:00Z', available: false, period: 'afternoon', reason: 'blocked-by-booking' },
  { time: '18:00', iso: '2026-05-15T11:00:00Z', available: true,  period: 'evening'   },
  { time: '19:30', iso: '2026-05-15T12:30:00Z', available: true,  period: 'evening'   },
];

export const MOCK_EXPECTATIONS = [
  { slug: 'consult-24-7',       icon: '💬', label: 'Tư vấn tự động 24/7',           description: 'Trả lời sản phẩm, giá, ship, chính sách' },
  { slug: 'image-recognition',  icon: '📸', label: 'Nhận diện hình ảnh khách gửi',  description: 'Bot hiểu hình → gợi ý đúng sản phẩm' },
  { slug: 'close-order',        icon: '🛒', label: 'Chốt đơn + làm rõ nhu cầu',     description: 'Tự thu thập thông tin, tạo đơn' },
  { slug: 'lead-capture',       icon: '📞', label: 'Xin SĐT/Zalo, chuyển tư vấn',   description: 'Lọc khách tiềm năng cho nhân viên' },
  { slug: 'other',              icon: '✏️', label: 'Khác',                          description: '(điền cụ thể bên dưới)' },
] as const;

export const MOCK_THANK_YOU = {
  bookingId: 'preview-mock-id',
  dateLabel: 'T6, 15/05/2026',
  timeRange: '14:00 – 14:20 (20 phút)',
  phoneMask: '0912 xxx 5678',
};

export const PERIOD_META = {
  morning:   { emoji: '☀️',  label: 'Sáng',  gradient: 'from-amber-300 to-orange-400'    },
  midday:    { emoji: '🍱',  label: 'Trưa',  gradient: 'from-orange-300 to-rose-400'     },
  afternoon: { emoji: '🌤️',  label: 'Chiều', gradient: 'from-sky-300 to-cyan-400'        },
  evening:   { emoji: '🌙',  label: 'Tối',   gradient: 'from-indigo-400 to-violet-500'   },
  night:     { emoji: '🌌',  label: 'Khuya', gradient: 'from-slate-600 to-violet-700'    },
} as const;

/**
 * Slot grid per day — deterministic mock generator. Each day gets the same
 * shape with slight variation per index to make preview look real.
 */
function buildSlotsForDay(date: string, dayIndex: number): Slot[] {
  // Working windows (LOCKED 2026-05-15):
  //   09:00 → 11:30  (6 slots — morning + early midday)
  //   14:00 → 19:30  (12 slots — afternoon + evening)
  // Total = 18 slots/day
  const windows: Array<[number, number]> = [[9, 12], [14, 20]];
  const baseSlots: Array<[string, Slot['period']]> = [];
  for (const [start, endExclusive] of windows) {
    for (let h = start; h < endExclusive; h++) {
      const period: Slot['period'] =
        h < 11 ? 'morning' : h < 14 ? 'midday' : h < 18 ? 'afternoon' : 'evening';
      baseSlots.push([`${String(h).padStart(2, '0')}:00`, period]);
      baseSlots.push([`${String(h).padStart(2, '0')}:30`, period]);
    }
  }
  // Drop the 12:00 slot since window is 09:00 → 11:30 (last slot 11:30)
  // — endExclusive=12 makes loop generate up to 11:30 inclusive (h=11 last).
  // Same logic for evening: endExclusive=20 → last slot 19:30. So no extra trim needed.
  return baseSlots.map(([time, period], i) => {
    const blocked = (dayIndex * 3 + i * 7) % 11 === 0;
    const [hh, mm] = time.split(':');
    const isoLocal = `${date}T${hh}:${mm}:00+07:00`;
    return {
      time,
      iso: new Date(isoLocal).toISOString(),
      available: !blocked,
      period,
      ...(blocked ? { reason: 'blocked-by-booking' as const } : {}),
    };
  });
}

export const MOCK_SLOTS_BY_DAY: Record<string, Slot[]> = Object.fromEntries(
  MOCK_DAYS.map((d, i) => [d.date, buildSlotsForDay(d.date, i)]),
);
