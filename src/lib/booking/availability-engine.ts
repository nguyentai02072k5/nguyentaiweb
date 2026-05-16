/**
 * availability-engine.ts — Pure functions to compute bookable slots.
 *
 * No I/O. Caller fetches bookings/blocks/config from DB and passes in.
 * Forward-only 2h block: a slot S is blocked by an existing booking T
 * only when 0 <= S - T < block_hours_forward.
 */

import type { DayAvailability, Slot, SlotsForDay, TimePeriod } from './types';
import {
  getHcmParts,
  hcmDateTimeToDate,
  isSameHcmDay,
  toHcmDateString,
  toHcmTimeString,
} from '@/lib/format/date-vn';

// ---------------------------------------------------------------------------
// Inputs from DB (caller fetches these via supabaseAdmin)
// ---------------------------------------------------------------------------

export type BookingRow = {
  meeting_start: string; // ISO timestamp
  status: string;
};

export type BlockedPeriodRow = {
  start_at: string;
  end_at: string;
};

export type BookingConfig = {
  slot_interval_minutes: number;
  block_hours_forward: number;
  min_advance_minutes: number;
  default_duration_minutes: number;
  curation_skip_hours: number[];
};

// ---------------------------------------------------------------------------
// Slot generation
// ---------------------------------------------------------------------------

/** Map hour 0-23 to time-of-day period. */
export function hourToPeriod(hour: number): TimePeriod {
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

const ACTIVE_STATUSES = new Set(['pending', 'confirmed']);

/**
 * Compute all 30-min (or configured interval) slots for a given HCM date.
 * Returns full grid (24h × N slots/hour) with `available` flag per slot.
 */
export function computeDaySlots(args: {
  hcmDateString: string; // 'YYYY-MM-DD' in HCM tz
  now: Date;
  bookings: BookingRow[];
  blocks: BlockedPeriodRow[];
  config: BookingConfig;
}): Slot[] {
  const { hcmDateString, now, bookings, blocks, config } = args;

  const slots: Slot[] = [];
  const intervalMin = config.slot_interval_minutes;
  const slotsPerDay = (24 * 60) / intervalMin;

  // Pre-filter active bookings around this day (forward block can cross midnight)
  const blockMs = config.block_hours_forward * 60 * 60 * 1000;
  const activeBookingTimes = bookings
    .filter((b) => ACTIVE_STATUSES.has(b.status))
    .map((b) => new Date(b.meeting_start).getTime());

  const minAdvanceMs = config.min_advance_minutes * 60 * 1000;
  const earliestBookable = now.getTime() + minAdvanceMs;
  const nowMs = now.getTime();
  const durationMs = config.default_duration_minutes * 60 * 1000;

  // Hours outside working window — slot grid completely skips these
  // (vs old behavior: only curator skipped, full grid still showed all 48 slots).
  const skipHours = new Set(config.curation_skip_hours);

  for (let i = 0; i < slotsPerDay; i++) {
    const totalMin = i * intervalMin;
    const hour = Math.floor(totalMin / 60);
    const minute = totalMin % 60;

    // Skip hours outside working window entirely — don't push slot at all
    if (skipHours.has(hour)) continue;

    const slotDate = hcmDateTimeToDate(hcmDateString, hour, minute);
    const slotMs = slotDate.getTime();

    const reason = classifySlot({
      slotMs,
      slotEndMs: slotMs + durationMs,
      nowMs,
      earliestBookable,
      activeBookingTimes,
      blockMs,
      blocks,
    });

    slots.push({
      time: toHcmTimeString(slotDate),
      iso: slotDate.toISOString(),
      available: reason === null,
      period: hourToPeriod(hour),
      ...(reason ? { reason } : {}),
    });
  }

  return slots;
}

function classifySlot(args: {
  slotMs: number;
  slotEndMs: number;
  nowMs: number;
  earliestBookable: number;
  activeBookingTimes: number[];
  blockMs: number;
  blocks: BlockedPeriodRow[];
}): Slot['reason'] | null {
  const { slotMs, slotEndMs, nowMs, earliestBookable, activeBookingTimes, blockMs, blocks } = args;

  if (slotMs < nowMs) return 'past';
  if (slotMs < earliestBookable) return 'too-soon';

  // 2h forward block: an existing booking blocks itself and later slots only.
  for (const t of activeBookingTimes) {
    const minutesAfterBooking = slotMs - t;
    if (minutesAfterBooking >= 0 && minutesAfterBooking < blockMs) {
      return 'blocked-by-booking';
    }
  }

  // Manual blocked periods
  for (const block of blocks) {
    const start = new Date(block.start_at).getTime();
    const end = new Date(block.end_at).getTime();
    if (slotMs < end && slotEndMs > start) return 'manual-block';
  }

  return null;
}

// ---------------------------------------------------------------------------
// Day-level summary (for the date picker)
// ---------------------------------------------------------------------------

const WEEKDAY_VN_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

export function computeDayAvailability(args: {
  hcmDateString: string;
  now: Date;
  bookings: BookingRow[];
  blocks: BlockedPeriodRow[];
  config: BookingConfig;
}): DayAvailability {
  const slots = computeDaySlots(args);
  const availableCount = slots.filter((s) => s.available).length;

  // Use noon UTC of that date for weekday calc — safe across DST (HCM has none)
  const sampleDate = new Date(`${args.hcmDateString}T12:00:00+07:00`);
  const { dayOfWeek, day, month } = getHcmParts(sampleDate);

  return {
    date: args.hcmDateString,
    dayOfWeek,
    label: `${WEEKDAY_VN_SHORT[dayOfWeek]} ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
    isToday: isSameHcmDay(sampleDate, args.now),
    availableCount,
  };
}

// ---------------------------------------------------------------------------
// Convenience: bundle slots + curated picks for the slot picker endpoint
// ---------------------------------------------------------------------------

export function bundleSlotsForDay(args: {
  hcmDateString: string;
  slots: Slot[];
  curatedTimes: string[];
}): SlotsForDay {
  return {
    date: args.hcmDateString,
    slots: args.slots,
    curatedPicks: args.curatedTimes,
  };
}

// Re-export for callers that want one entry point
export { toHcmDateString };
