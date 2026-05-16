/**
 * slot-curator.ts — Pick 3-5 representative slots spread across time-of-day.
 *
 * Phase 06 UX rule: don't show all 48 slots — too many choices = paralysis.
 * Default shows curated picks, "Xem thêm" button reveals full grid.
 */

import type { Slot, TimePeriod } from './types';
import { TIME_PERIODS } from './types';

const PERIOD_ORDER: readonly TimePeriod[] = TIME_PERIODS; // morning → night

/**
 * Pick up to 5 slots spread across periods. One per period; skip 'night'
 * by default (likely outside owner working preference unless explicitly
 * keep-everything case). Respects `skipHours` from booking_config.
 */
export function curatePicks(args: {
  slots: Slot[];
  skipHours: number[];
  /** Include 'night' (22:00-05:59) in picks. Default false — too unusual. */
  includeNight?: boolean;
  /** Hard cap on returned picks. Default 5. */
  maxPicks?: number;
}): string[] {
  const { slots, skipHours, includeNight = false, maxPicks = 5 } = args;

  const skip = new Set(skipHours);
  const available = slots.filter(
    (s) => s.available && !skip.has(parseHourFromTime(s.time)),
  );

  const byPeriod = new Map<TimePeriod, Slot[]>();
  for (const s of available) {
    if (!includeNight && s.period === 'night') continue;
    const list = byPeriod.get(s.period) ?? [];
    list.push(s);
    byPeriod.set(s.period, list);
  }

  // One pick per period (the earliest available slot in that period)
  const picks: string[] = [];
  for (const period of PERIOD_ORDER) {
    if (period === 'night' && !includeNight) continue;
    const list = byPeriod.get(period);
    if (list && list.length > 0) picks.push(list[0].time);
    if (picks.length >= maxPicks) return picks;
  }

  // If still under maxPicks, fill from the period with most remaining slots
  if (picks.length < maxPicks) {
    const usedTimes = new Set(picks);
    const remaining = available
      .filter((s) => !usedTimes.has(s.time))
      .filter((s) => includeNight || s.period !== 'night');
    for (const s of remaining) {
      picks.push(s.time);
      if (picks.length >= maxPicks) break;
    }
  }

  return picks;
}

function parseHourFromTime(time: string): number {
  return parseInt(time.slice(0, 2), 10);
}
