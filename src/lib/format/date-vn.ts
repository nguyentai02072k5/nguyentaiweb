/**
 * date-vn.ts — VN-locale + Asia/Ho_Chi_Minh formatters and date math.
 *
 * DB stores timestamptz (UTC). UI renders in HCM tz. Server may run with
 * TZ=Asia/Ho_Chi_Minh hint, but we never rely on process TZ for display —
 * always pass timeZone explicitly to Intl for determinism.
 */

const HCM_TZ = 'Asia/Ho_Chi_Minh';

// Short VN weekday: T2..T7, CN
const WEEKDAY_VN_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

/**
 * Extract HCM-local calendar parts from any Date.
 * Avoids `getDate()` etc. which use server TZ.
 */
export function getHcmParts(d: Date): {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
  dayOfWeek: number; // 0=Sun .. 6=Sat
} {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: HCM_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(d).map((p) => [p.type, p.value]),
  );
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour === '24' ? '00' : parts.hour),
    minute: Number(parts.minute),
    dayOfWeek: weekdayMap[parts.weekday ?? 'Mon'] ?? 1,
  };
}

/** Format `YYYY-MM-DD` from a Date in HCM tz. */
export function toHcmDateString(d: Date): string {
  const { year, month, day } = getHcmParts(d);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Format `HH:mm` from a Date in HCM tz. */
export function toHcmTimeString(d: Date): string {
  const { hour, minute } = getHcmParts(d);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** `T2 11/05` — short day-chip label. */
export function formatDayChip(d: Date): string {
  const { day, month, dayOfWeek } = getHcmParts(d);
  return `${WEEKDAY_VN_SHORT[dayOfWeek]} ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
}

/** `T2, 11/05/2026` — long display for confirm screen. */
export function formatDateLong(d: Date): string {
  const { year, month, day, dayOfWeek } = getHcmParts(d);
  return `${WEEKDAY_VN_SHORT[dayOfWeek]}, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

/** `15:00 ngày 16/5/2026` — natural Vietnamese label for messages/webhooks. */
export function formatHcmLabelVi(d: Date): string {
  const { year, month, day, hour, minute } = getHcmParts(d);
  const hh = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return `${hh} ngày ${day}/${month}/${year}`;
}

/** `14:00 – 14:20 (20 phút)` */
export function formatMeetingRange(start: Date, end: Date): string {
  const startT = toHcmTimeString(start);
  const endT = toHcmTimeString(end);
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  return `${startT} – ${endT} (${mins} phút)`;
}

/** Two dates are the same calendar day in HCM tz. */
export function isSameHcmDay(a: Date, b: Date): boolean {
  return toHcmDateString(a) === toHcmDateString(b);
}

/** Today in HCM tz (returns `YYYY-MM-DD`). */
export function hcmToday(now: Date = new Date()): string {
  return toHcmDateString(now);
}

/**
 * Return `N` consecutive HCM-local dates starting from `startDate` (inclusive),
 * as `YYYY-MM-DD` strings. Used for the day picker.
 */
export function nextHcmDates(startDate: Date, count: number): string[] {
  const result: string[] = [];
  // Walk one day at a time in UTC, but compute HCM date each step
  const cursor = new Date(startDate);
  for (let i = 0; i < count; i++) {
    result.push(toHcmDateString(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}

/**
 * Build a Date for a specific HCM wall-clock time on a given `YYYY-MM-DD`.
 * HCM offset is fixed +07:00 (no DST), so we construct the ISO string directly.
 */
export function hcmDateTimeToDate(dateStr: string, hour: number, minute: number): Date {
  const iso = `${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+07:00`;
  return new Date(iso);
}
