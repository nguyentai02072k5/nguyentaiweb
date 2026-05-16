/**
 * GET /api/availability/slots?date=YYYY-MM-DD
 *
 * Returns all 30-min slots for the given HCM-local date with `available` flag,
 * plus a curated list of 3-5 picks spread across time-of-day for default UI.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import {
  computeDaySlots,
  bundleSlotsForDay,
  type BookingRow,
  type BlockedPeriodRow,
  type BookingConfig,
} from '@/lib/booking/availability-engine';
import { curatePicks } from '@/lib/booking/slot-curator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const now = new Date();
  const url = new URL(request.url);
  const date = url.searchParams.get('date');

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'invalid-date', message: '`date` must be YYYY-MM-DD' },
      { status: 400 },
    );
  }

  // Fetch ±1 day of bookings (2h block can reach across midnight)
  const dayStart = `${date}T00:00:00+07:00`;
  const dayEnd = `${date}T23:59:59+07:00`;
  const windowStart = new Date(new Date(dayStart).getTime() - 24 * 3600 * 1000).toISOString();
  const windowEnd = new Date(new Date(dayEnd).getTime() + 24 * 3600 * 1000).toISOString();

  const [configRes, bookingsRes, blocksRes] = await Promise.all([
    supabaseAdmin.from('booking_config').select('*').eq('id', 1).single(),
    supabaseAdmin
      .from('bookings')
      .select('meeting_start,status')
      .in('status', ['pending', 'confirmed'])
      .gte('meeting_start', windowStart)
      .lte('meeting_start', windowEnd),
    supabaseAdmin
      .from('blocked_periods')
      .select('start_at,end_at')
      .gte('end_at', windowStart)
      .lte('start_at', windowEnd),
  ]);

  if (configRes.error || !configRes.data) {
    return serverError('config-load', configRes.error?.message);
  }
  if (bookingsRes.error) return serverError('bookings-load', bookingsRes.error.message);
  if (blocksRes.error) return serverError('blocks-load', blocksRes.error.message);

  const config: BookingConfig = configRes.data;
  const bookings: BookingRow[] = bookingsRes.data ?? [];
  const blocks: BlockedPeriodRow[] = blocksRes.data ?? [];

  const slots = computeDaySlots({
    hcmDateString: date,
    now,
    bookings,
    blocks,
    config,
  });

  const curatedPicks = curatePicks({
    slots,
    skipHours: config.curation_skip_hours,
  });

  return NextResponse.json(bundleSlotsForDay({ hcmDateString: date, slots, curatedTimes: curatedPicks }));
}

function serverError(code: string, detail?: string) {
  return NextResponse.json(
    { error: code, message: detail ?? 'Server error' },
    { status: 500 },
  );
}
