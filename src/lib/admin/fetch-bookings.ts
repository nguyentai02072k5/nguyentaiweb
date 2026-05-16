/**
 * admin/fetch-bookings.ts — Query bookings cho dashboard admin.
 *
 * Tách helper riêng để page admin chỉ lo render + filter UI.
 * Dùng service_role qua supabaseAdmin → bỏ qua RLS (owner-only access).
 */

import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import type { Tables } from '@/lib/supabase/database-types';

export type BookingRow = Tables<'bookings'>;

export type BookingStatusFilter = 'all' | BookingRow['status'];

export type FetchBookingsOptions = {
  status?: BookingStatusFilter;
  search?: string;
  limit?: number;
};

export async function fetchBookings(
  options: FetchBookingsOptions = {},
): Promise<{ data: BookingRow[]; error: string | null }> {
  const { status = 'all', search, limit = 200 } = options;

  let query = supabaseAdmin
    .from('bookings')
    .select('*')
    .order('meeting_start', { ascending: false })
    .limit(limit);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (search && search.trim().length > 0) {
    const q = search.trim().replace(/[%,]/g, '');
    // ilike OR across phone/email/full_name
    query = query.or(
      `phone_zalo.ilike.%${q}%,email.ilike.%${q}%,full_name.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error('[admin] fetchBookings failed', error);
    return { data: [], error: error.message };
  }
  return { data: data ?? [], error: null };
}

export type BookingStats = {
  total: number;
  today: number;
  upcoming: number;
  pending: number;
  confirmed: number;
  cancelled: number;
};

export function computeStats(rows: BookingRow[], now: Date = new Date()): BookingStats {
  const stats: BookingStats = {
    total: rows.length,
    today: 0,
    upcoming: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  };

  const todayStr = toHcmDateStr(now);
  const nowMs = now.getTime();

  for (const row of rows) {
    const startMs = new Date(row.meeting_start).getTime();
    if (toHcmDateStr(new Date(row.meeting_start)) === todayStr) {
      stats.today++;
    }
    if (startMs >= nowMs && (row.status === 'pending' || row.status === 'confirmed')) {
      stats.upcoming++;
    }
    if (row.status === 'pending') stats.pending++;
    if (row.status === 'confirmed') stats.confirmed++;
    if (row.status === 'cancelled') stats.cancelled++;
  }
  return stats;
}

function toHcmDateStr(d: Date): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(d);
}
