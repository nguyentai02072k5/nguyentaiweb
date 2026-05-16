/**
 * booking-mcp-tools.ts — Pure handlers for MCP booking tools.
 *
 * Each function is the business logic for one MCP tool. Kept transport-free
 * so the same code could be reused from a CLI or test harness. The MCP route
 * handler (`/api/mcp`) wires these into the JSON-RPC tools/call dispatch.
 *
 * MCP-specific simplifications vs the public /api/book route:
 *   - No IP hash (no real client IP available from the LLM transport)
 *   - No Meta CAPI (no browser cookies / consent context)
 *   - Webhook still fires (owner wants chatbot bookings notified too)
 */

import 'server-only';
import { after } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import { normalizeVnPhone, maskVnPhone } from '@/lib/format/phone-vn';
import { toHcmDateString, hcmToday, nextHcmDates, formatHcmLabelVi } from '@/lib/format/date-vn';
import { EXPECTATION_SLUGS } from '@/lib/booking/types';
import {
  computeDayAvailability,
  computeDaySlots,
} from '@/lib/booking/availability-engine';
import {
  fetchAvailabilityWindow,
  singleDayWindow,
  multiDayWindow,
} from '@/lib/booking/availability-fetch';

// ---------------------------------------------------------------------------
// Tool: list_available_days
// ---------------------------------------------------------------------------

export type ListAvailableDaysInput = {
  start_date?: string;
  count?: number;
};

export async function listAvailableDays(input: ListAvailableDaysInput) {
  const now = new Date();
  const startDate = input.start_date ?? hcmToday(now);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return mcpError('invalid-date', '`start_date` must be YYYY-MM-DD');
  }

  const count = clampInt(input.count ?? 7, 1, 14);
  const dates = nextHcmDates(new Date(`${startDate}T00:00:00+07:00`), count);
  const window = multiDayWindow(dates);
  const fetched = await fetchAvailabilityWindow(window);
  if (!fetched.ok) return mcpError(fetched.error.code, fetched.error.message);

  const { config, bookings, blocks } = fetched.data;
  const days = dates.map((d) =>
    computeDayAvailability({ hcmDateString: d, now, bookings, blocks, config }),
  );

  return mcpJson({
    days: days.map((d) => ({
      date: d.date,
      label: d.label,
      day_of_week: d.dayOfWeek,
      available_count: d.availableCount,
      is_today: d.isToday,
    })),
    total_available: days.reduce((sum, d) => sum + d.availableCount, 0),
    timezone: 'Asia/Ho_Chi_Minh',
  });
}

// ---------------------------------------------------------------------------
// Tool: list_slots_for_day
// ---------------------------------------------------------------------------

export type ListSlotsForDayInput = {
  date: string;
};

export async function listSlotsForDay(input: ListSlotsForDayInput) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return mcpError('invalid-date', '`date` must be YYYY-MM-DD');
  }

  const now = new Date();
  const window = singleDayWindow(input.date);
  const fetched = await fetchAvailabilityWindow(window);
  if (!fetched.ok) return mcpError(fetched.error.code, fetched.error.message);

  const { config, bookings, blocks } = fetched.data;
  const slots = computeDaySlots({
    hcmDateString: input.date,
    now,
    bookings,
    blocks,
    config,
  });

  return mcpJson({
    date: input.date,
    timezone: 'Asia/Ho_Chi_Minh',
    slot_duration_minutes: 30,
    slots: slots.map((s) => ({
      iso: s.iso,
      time: s.time,
      period: s.period,
      available: s.available,
      reason: s.available ? undefined : s.reason,
    })),
  });
}

// ---------------------------------------------------------------------------
// Tool: create_booking
// ---------------------------------------------------------------------------

export type CreateBookingInput = {
  full_name: string;
  phone: string;
  meeting_start_iso: string;
  email?: string;
  expectations?: string[];
  expectation_other?: string;
  source?: string;
};

export async function createBookingViaMcp(input: CreateBookingInput) {
  // ---- Validate name + phone ----
  const fullName = input.full_name?.trim();
  if (!fullName || fullName.length < 2 || fullName.length > 100) {
    return mcpError('validation', '`full_name` length must be 2-100 chars');
  }

  const phone = normalizeVnPhone(input.phone ?? '');
  if (!phone) {
    return mcpError('validation', '`phone` is not a valid VN number');
  }

  // ---- Validate ISO timestamp ----
  const ts = Date.parse(input.meeting_start_iso ?? '');
  if (!Number.isFinite(ts)) {
    return mcpError('validation', '`meeting_start_iso` is not a valid ISO 8601 datetime');
  }

  // ---- Validate expectations enum ----
  const expectations = (input.expectations ?? []).filter(Boolean);
  for (const e of expectations) {
    if (!(EXPECTATION_SLUGS as readonly string[]).includes(e)) {
      return mcpError('validation', `Unknown expectation slug: ${e}`);
    }
  }
  const expectationOther =
    typeof input.expectation_other === 'string' ? input.expectation_other.trim() || undefined : undefined;
  if (expectations.includes('other') && !expectationOther) {
    return mcpError('validation', '`expectation_other` required when expectations contains "other"');
  }
  if (!expectations.includes('other') && expectationOther) {
    return mcpError('validation', '`expectation_other` only allowed when expectations contains "other"');
  }

  // ---- Validate email if provided ----
  const email = input.email?.trim() || undefined;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return mcpError('validation', '`email` is not a valid email address');
  }

  // ---- Re-check slot via engine (single source of truth) ----
  const candidate = new Date(ts);
  const date = toHcmDateString(candidate);
  const window = singleDayWindow(date);
  const fetched = await fetchAvailabilityWindow(window);
  if (!fetched.ok) return mcpError(fetched.error.code, fetched.error.message);

  const slots = computeDaySlots({
    hcmDateString: date,
    now: new Date(),
    config: fetched.data.config,
    bookings: fetched.data.bookings,
    blocks: fetched.data.blocks,
  });
  const requested = slots.find((s) => s.iso === candidate.toISOString());
  if (!requested) {
    return mcpError('validation', 'Meeting time must align with a 30-minute slot boundary');
  }
  if (!requested.available) {
    return mcpError('slot-taken', `Slot unavailable (reason: ${requested.reason ?? 'unknown'})`);
  }

  // ---- Call RPC ----
  const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('create_booking', {
    p_phone_zalo: phone,
    p_meeting_start: candidate.toISOString(),
    p_email: email,
    p_full_name: fullName,
    p_expectations: expectations,
    p_expectation_other: expectationOther,
    p_user_agent: 'mcp-client',
    p_ip_hash: undefined,
    p_source: input.source ?? 'mcp',
  });

  if (rpcError) {
    if (rpcError.code === '23P01') return mcpError('slot-taken', 'Slot was just taken by another booking');
    if (rpcError.code === '23514') return mcpError('validation', 'DB rejected payload (check constraint)');
    console.error('[mcp.create_booking] RPC error', rpcError);
    return mcpError('server', 'Database error creating booking');
  }

  const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!row?.id) return mcpError('server', 'RPC returned invalid shape');

  // ---- Fire-and-forget webhook via Next.js `after()` ----
  // On Vercel serverless, a plain `void promise` may be killed when the
  // response returns. `after()` keeps the invocation alive until the
  // callback resolves, same pattern as /api/book uses.
  const webhookUrl = process.env.WEBHOOK_URL;
  if (webhookUrl) {
    after(() =>
      sendOwnerWebhook(webhookUrl, {
        phone,
        full_name: fullName,
        email,
        expectations,
        expectation_other: expectationOther,
        meeting_start: row.meeting_start,
        meeting_end: row.meeting_end,
        source: input.source ?? 'mcp',
      }),
    );
  }

  return mcpJson({
    success: true,
    booking_id: row.id,
    meeting_start: row.meeting_start,
    meeting_end: row.meeting_end,
    meeting_start_label_vi: formatHcmLabelVi(new Date(row.meeting_start)),
    meeting_end_label_vi: formatHcmLabelVi(new Date(row.meeting_end)),
    phone_mask: maskVnPhone(phone),
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mcpJson(payload: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }],
  };
}

function mcpError(code: string, message: string) {
  return {
    isError: true,
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({ error: code, message }, null, 2),
      },
    ],
  };
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

async function sendOwnerWebhook(
  url: string,
  data: {
    phone: string;
    full_name: string;
    email?: string;
    expectations: string[];
    expectation_other?: string;
    meeting_start: string;
    meeting_end: string;
    source: string;
  },
) {
  const startLabel = formatHcmLabelVi(new Date(data.meeting_start));
  const endLabel = formatHcmLabelVi(new Date(data.meeting_end));
  const lines = [
    `📅 **Booking mới (qua ${data.source})**`,
    `👤 ${data.full_name} · ${data.phone}`,
    data.email ? `✉️ ${data.email}` : null,
    `⏰ ${startLabel} → ${endLabel}`,
    data.expectations.length > 0 ? `🎯 ${data.expectations.join(', ')}` : null,
    data.expectation_other ? `📝 ${data.expectation_other}` : null,
  ].filter(Boolean);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        content: lines.join('\n'),
        data: {
          ...data,
          meeting_start_label_vi: startLabel,
          meeting_end_label_vi: endLabel,
        },
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      console.error(`[mcp.webhook] HTTP ${res.status}`, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('[mcp.webhook] dispatch failed', err);
  }
}
