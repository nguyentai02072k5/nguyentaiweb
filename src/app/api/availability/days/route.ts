/**
 * GET /api/availability/days
 *
 * Returns the next N (default 7) HCM-local dates with bookable slot counts.
 * Query: ?start=YYYY-MM-DD (optional, default = today HCM) &count=7
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import {
  computeDayAvailability,
  type BookingRow,
  type BlockedPeriodRow,
  type BookingConfig,
} from '@/lib/booking/availability-engine';
import { hcmToday, nextHcmDates } from '@/lib/format/date-vn';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const now = new Date();
  const url = new URL(request.url);
  const start = url.searchParams.get('start') ?? hcmToday(now);
  const count = clamp(Number(url.searchParams.get('count') ?? 7), 1, 14);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    return NextResponse.json(
      { error: 'invalid-date', message: '`start` must be YYYY-MM-DD' },
      { status: 400 },
    );
  }

  const dates = nextHcmDates(new Date(`${start}T00:00:00+07:00`), count);
  const windowStart = new Date(new Date(`${start}T00:00:00+07:00`).getTime() - 24 * 3600 * 1000).toISOString();
  const windowEnd = new Date(new Date(`${dates[dates.length - 1]}T23:59:59+07:00`).getTime() + 24 * 3600 * 1000).toISOString();

  // Fetch shared data once, compute all days in-memory
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

  const days = dates.map((d) =>
    computeDayAvailability({ hcmDateString: d, now, bookings, blocks, config }),
  );

  // Stats for social-proof strip: total available slots + recent bookings in 24h
  const total_available = days.reduce((sum, d) => sum + d.availableCount, 0);

  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
  const recentRes = await supabaseAdmin
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .in('status', ['pending', 'confirmed', 'completed'])
    .gte('created_at', twentyFourHoursAgo);

  const recent_bookings_24h = recentRes.count ?? 0;

  return NextResponse.json({ days, total_available, recent_bookings_24h });
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function serverError(code: string, detail?: string) {
  return NextResponse.json(
    { error: code, message: detail ?? 'Server error' },
    { status: 500 },
  );
}
