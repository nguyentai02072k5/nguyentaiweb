/**
 * availability-fetch.ts — Shared Supabase fetch for booking availability.
 *
 * Centralizes the config + bookings + blocked_periods query used by both
 * the public availability routes and the MCP server tools. Returns the
 * raw data; callers run `computeDayAvailability` / `computeDaySlots` to
 * shape the result for their context.
 */

import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import type {
  BookingConfig,
  BookingRow,
  BlockedPeriodRow,
} from '@/lib/booking/availability-engine';

export type AvailabilityWindow = {
  config: BookingConfig;
  bookings: BookingRow[];
  blocks: BlockedPeriodRow[];
};

export type AvailabilityFetchError = {
  code: 'config-load' | 'bookings-load' | 'blocks-load';
  message: string;
};

/**
 * Fetch config + bookings + blocked periods overlapping the given UTC window.
 * The caller passes pre-computed ISO bounds so it can match its display range
 * (typically ±24h around the target date to catch 2h-block boundaries).
 */
export async function fetchAvailabilityWindow(args: {
  windowStartIso: string;
  windowEndIso: string;
}): Promise<{ ok: true; data: AvailabilityWindow } | { ok: false; error: AvailabilityFetchError }> {
  const [configRes, bookingsRes, blocksRes] = await Promise.all([
    supabaseAdmin.from('booking_config').select('*').eq('id', 1).single(),
    supabaseAdmin
      .from('bookings')
      .select('meeting_start,status')
      .in('status', ['pending', 'confirmed'])
      .gte('meeting_start', args.windowStartIso)
      .lte('meeting_start', args.windowEndIso),
    supabaseAdmin
      .from('blocked_periods')
      .select('start_at,end_at')
      .gte('end_at', args.windowStartIso)
      .lte('start_at', args.windowEndIso),
  ]);

  if (configRes.error || !configRes.data) {
    return { ok: false, error: { code: 'config-load', message: configRes.error?.message ?? 'config missing' } };
  }
  if (bookingsRes.error) {
    return { ok: false, error: { code: 'bookings-load', message: bookingsRes.error.message } };
  }
  if (blocksRes.error) {
    return { ok: false, error: { code: 'blocks-load', message: blocksRes.error.message } };
  }

  return {
    ok: true,
    data: {
      config: configRes.data as BookingConfig,
      bookings: (bookingsRes.data ?? []) as BookingRow[],
      blocks: (blocksRes.data ?? []) as BlockedPeriodRow[],
    },
  };
}

/**
 * Compute the standard ±24h UTC window around a single HCM-local date.
 * Use when fetching availability for one day (slot-level detail).
 */
export function singleDayWindow(hcmDateString: string): { windowStartIso: string; windowEndIso: string } {
  const dayStartMs = new Date(`${hcmDateString}T00:00:00+07:00`).getTime();
  const dayEndMs = new Date(`${hcmDateString}T23:59:59+07:00`).getTime();
  return {
    windowStartIso: new Date(dayStartMs - 24 * 3600 * 1000).toISOString(),
    windowEndIso: new Date(dayEndMs + 24 * 3600 * 1000).toISOString(),
  };
}

/**
 * Compute the standard ±24h UTC window spanning a list of consecutive HCM-local dates.
 * Use when fetching availability across multiple days (day-level summary).
 */
export function multiDayWindow(hcmDateStrings: string[]): { windowStartIso: string; windowEndIso: string } {
  if (hcmDateStrings.length === 0) {
    throw new Error('multiDayWindow: dates array is empty');
  }
  const first = hcmDateStrings[0];
  const last = hcmDateStrings[hcmDateStrings.length - 1];
  const startMs = new Date(`${first}T00:00:00+07:00`).getTime();
  const endMs = new Date(`${last}T23:59:59+07:00`).getTime();
  return {
    windowStartIso: new Date(startMs - 24 * 3600 * 1000).toISOString(),
    windowEndIso: new Date(endMs + 24 * 3600 * 1000).toISOString(),
  };
}
