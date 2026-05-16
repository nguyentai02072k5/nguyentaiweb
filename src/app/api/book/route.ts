/**
 * POST /api/book
 *
 * Flow (v1 KISS — LOCKED 2026-05-14):
 *   1. Zod validate body
 *   2. Normalize VN phone (paste-friendly → canonical 0XXXXXXXXX)
 *   3. Hash client IP for spam detection
 *   4. Call RPC create_booking — DB enforces 2h exclusion + check constraints
 *   5. Map DB errors:
 *      - 23P01 (exclusion)  → 409 slot-taken
 *      - 23514 (check)      → 400 validation
 *      - else               → 500
 *   6. Optional fire-and-forget webhook (Discord/Slack) via Next.js `after()`
 *   7. Return booking_id + meeting range + masked phone
 */

import { NextResponse, after } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import { bookingFormSchema } from '@/lib/validators/booking-schema';
import { normalizeVnPhone, maskVnPhone } from '@/lib/format/phone-vn';
import { hashIp, getClientIp } from '@/lib/security/ip-hash';
import type { BookingResponse } from '@/lib/booking/types';
import {
  computeDaySlots,
  type BookingConfig,
  type BookingRow,
  type BlockedPeriodRow,
} from '@/lib/booking/availability-engine';
import { toHcmDateString, formatHcmLabelVi } from '@/lib/format/date-vn';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // ---- 1. Parse + Zod validate ----
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('validation', 'Body không hợp lệ', 400);
  }

  const parsed = bookingFormSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation', 'Dữ liệu form không hợp lệ', 400, parsed.error.issues);
  }
  const data = parsed.data;

  // ---- 2. Phone normalize ----
  const phone = normalizeVnPhone(data.phone_zalo);
  if (!phone) {
    return jsonError('validation', 'Số điện thoại không đúng định dạng VN', 400);
  }

  // ---- 3. IP hash ----
  const ip = getClientIp(request.headers);
  let ipHash: string | null = null;
  try {
    ipHash = hashIp(ip);
  } catch {
    // IP_HASH_SALT missing — log but don't block booking
    console.error('[book] IP hash failed — booking continues without ip_hash');
  }

  // ---- 4. Re-check slot server-side before RPC ----
  const slotCheck = await checkRequestedSlot(data.meeting_start_iso);
  if (!slotCheck.ok) {
    return jsonError(slotCheck.error, slotCheck.message, slotCheck.status);
  }

  // ---- 5. Call RPC ----
  const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('create_booking', {
    p_phone_zalo: phone,
    p_meeting_start: data.meeting_start_iso,
    p_email: data.email,
    p_full_name: data.full_name,
    p_expectations: data.expectations,
    p_expectation_other: data.expectation_other,
    p_user_agent: request.headers.get('user-agent') ?? undefined,
    p_ip_hash: ipHash ?? undefined,
    p_source: 'landing-page',
  });

  if (rpcError) {
    const mapped = mapDbError(rpcError);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  // RPC returns table with single row — supabase-js represents as array
  const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!row?.id) {
    return jsonError('server', 'RPC trả về dữ liệu không hợp lệ', 500);
  }

  // ---- 6. Fire-and-forget webhook (v1 KISS) ----
  const webhookUrl = process.env.WEBHOOK_URL;
  if (webhookUrl) {
    after(() => sendWebhook(webhookUrl, {
      phone,
      full_name: data.full_name,
      email: data.email,
      expectations: data.expectations,
      expectation_other: data.expectation_other,
      meeting_start: row.meeting_start,
      meeting_end: row.meeting_end,
    }));
  }

  // ---- 7. Return success ----
  const response: BookingResponse = {
    success: true,
    booking_id: row.id,
    meeting_start: row.meeting_start,
    meeting_end: row.meeting_end,
    phone_mask: maskVnPhone(phone),
  };
  return NextResponse.json(response, { status: 201 });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonError(
  error: 'validation' | 'slot-taken' | 'server',
  message: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json({ success: false, error, message, details }, { status });
}

function mapDbError(err: { code?: string; message?: string }): {
  status: number;
  body: BookingResponse;
} {
  // Supabase JS surfaces Postgres error code in `code` when calling .rpc()
  if (err.code === '23P01') {
    return {
      status: 409,
      body: {
        success: false,
        error: 'slot-taken',
        message: 'Slot này vừa được đặt. Anh/chị chọn giờ khác giúp tôi nhé.',
      },
    };
  }
  if (err.code === '23514') {
    return {
      status: 400,
      body: {
        success: false,
        error: 'validation',
        message: 'Dữ liệu không hợp lệ. Kiểm tra số điện thoại và thời gian.',
      },
    };
  }
  console.error('[book] RPC error', err);
  return {
    status: 500,
    body: {
      success: false,
      error: 'server',
      message: 'Hệ thống đang bận. Vui lòng thử lại sau.',
    },
  };
}

async function checkRequestedSlot(meetingStartIso: string): Promise<
  | { ok: true }
  | { ok: false; error: 'validation' | 'slot-taken' | 'server'; message: string; status: number }
> {
  const candidate = new Date(meetingStartIso);
  const date = toHcmDateString(candidate);
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

  if (configRes.error || !configRes.data || bookingsRes.error || blocksRes.error) {
    console.error('[book] slot check failed', {
      config: configRes.error,
      bookings: bookingsRes.error,
      blocks: blocksRes.error,
    });
    return {
      ok: false,
      error: 'server',
      message: 'Hệ thống đang bận. Vui lòng thử lại sau.',
      status: 500,
    };
  }

  const slots = computeDaySlots({
    hcmDateString: date,
    now: new Date(),
    config: configRes.data as BookingConfig,
    bookings: (bookingsRes.data ?? []) as BookingRow[],
    blocks: (blocksRes.data ?? []) as BlockedPeriodRow[],
  });
  const requested = slots.find((slot) => slot.iso === candidate.toISOString());

  if (!requested) {
    return {
      ok: false,
      error: 'validation',
      message: 'Thời gian đặt lịch phải nằm đúng mốc 30 phút.',
      status: 400,
    };
  }

  if (requested.available) return { ok: true };

  const isConflict =
    requested.reason === 'blocked-by-booking' || requested.reason === 'manual-block';
  return {
    ok: false,
    error: isConflict ? 'slot-taken' : 'validation',
    message: slotUnavailableMessage(requested.reason),
    status: isConflict ? 409 : 400,
  };
}

function slotUnavailableMessage(reason: string | undefined): string {
  switch (reason) {
    case 'past':
      return 'Không thể đặt lịch trong quá khứ.';
    case 'too-soon':
      return 'Slot này quá gần thời điểm hiện tại. Anh/chị chọn giờ khác giúp tôi nhé.';
    case 'blocked-by-booking':
      return 'Slot này vừa được đặt. Anh/chị chọn giờ khác giúp tôi nhé.';
    case 'manual-block':
      return 'Slot này hiện không khả dụng. Anh/chị chọn giờ khác giúp tôi nhé.';
    default:
      return 'Slot này không khả dụng. Anh/chị chọn giờ khác giúp tôi nhé.';
  }
}

async function sendWebhook(
  url: string,
  data: {
    phone: string;
    full_name?: string;
    email?: string;
    expectations: readonly string[];
    expectation_other?: string;
    meeting_start: string;
    meeting_end: string;
  },
) {
  // Pre-format HCM (UTC+7) labels so downstream Zalo/n8n/Discord can render
  // "15:00 ngày 16/5/2026" without re-implementing tz math.
  const startLabel = formatHcmLabelVi(new Date(data.meeting_start));
  const endLabel = formatHcmLabelVi(new Date(data.meeting_end));

  const enriched = {
    ...data,
    meeting_start_label_vi: startLabel,
    meeting_end_label_vi: endLabel,
  };

  // Discord-friendly content + extra fields for n8n/Make/Slack parsers
  const lines = [
    `📅 **Booking mới**`,
    `👤 ${data.full_name ?? '(no name)'} · ${data.phone}`,
    data.email ? `✉️ ${data.email}` : null,
    `⏰ ${startLabel} → ${endLabel}`,
    data.expectations.length > 0 ? `🎯 ${data.expectations.join(', ')}` : null,
    data.expectation_other ? `📝 ${data.expectation_other}` : null,
  ].filter(Boolean);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: lines.join('\n'), data: enriched }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.error(`[webhook] HTTP ${res.status}`, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('[webhook] dispatch failed', err);
  }
}
