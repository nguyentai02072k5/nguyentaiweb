/**
 * POST /api/infor/submit
 *
 * Khách GỬI thông tin ở trang infor.nguyenvantai.com/<sđt>.
 * Flow (KISS):
 *   1. Zod validate body
 *   2. Normalize VN phone → canonical 0XXXXXXXXX
 *   3. Hash client IP (chống spam, không lưu IP gốc)
 *   4. RPC submit_lead - upsert lead theo SĐT, status → 'submitted'
 *   5. Webhook fire-and-forget (n8n/Discord/Zalo) nếu cấu hình
 *   6. Trả success + masked phone
 */

import { NextResponse, after } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import { leadSubmitSchema } from '@/lib/leads/lead-schema';
import { normalizeVnPhone, maskVnPhone } from '@/lib/format/phone-vn';
import { hashIp, getClientIp } from '@/lib/security/ip-hash';
import { LEAD_FIELD_BY_KEY, LEAD_FIELD_LABELS, formatLeadValue } from '@/lib/leads/lead-field-config';
import { triggerLeadAutomation } from '@/lib/automation/trigger-lead-automation';
import type { Json } from '@/lib/supabase/database-types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // ---- 1. Parse + validate ----
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('validation', 'Body không hợp lệ', 400);
  }

  const parsed = leadSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation', 'Dữ liệu form không hợp lệ', 400, parsed.error.issues);
  }
  const data = parsed.data;

  // ---- 2. Phone normalize ----
  const phone = normalizeVnPhone(data.phone);
  if (!phone) {
    return jsonError('validation', 'Số điện thoại không đúng định dạng VN', 400);
  }

  // ---- 3. IP hash ----
  const ip = getClientIp(request.headers);
  let ipHash: string | null = null;
  try {
    ipHash = hashIp(ip);
  } catch {
    console.error('[infor] IP hash failed - submit continues without ip_hash');
  }

  // ---- 4. RPC submit_lead ----
  const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('submit_lead', {
    p_phone: phone,
    p_full_name: data.full_name,
    p_payload: data.payload as Json,
    p_user_agent: request.headers.get('user-agent') ?? undefined,
    p_ip_hash: ipHash ?? undefined,
    p_source: 'infor-link',
  });

  if (rpcError) {
    console.error('[infor] submit_lead RPC error', rpcError);
    return jsonError('server', 'Hệ thống đang bận. Vui lòng thử lại sau.', 500);
  }

  const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!row?.id) {
    return jsonError('server', 'RPC trả về dữ liệu không hợp lệ', 500);
  }

  // ---- 5. Webhook fire-and-forget ----
  const webhookUrl = process.env.LEADS_WEBHOOK_URL ?? process.env.WEBHOOK_URL;
  if (webhookUrl) {
    after(() => sendWebhook(webhookUrl, { phone, full_name: data.full_name, payload: data.payload }));
  }

  // ---- 5b. Auto-trigger flow automation Zalo (fire-and-forget) ----
  after(() => triggerLeadAutomation({ phone, name: data.full_name, source: 'infor' }));

  // ---- 6. Success ----
  return NextResponse.json(
    { success: true, lead_id: row.id, phone_mask: maskVnPhone(phone) },
    { status: 201 },
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonError(
  error: 'validation' | 'server',
  message: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json({ success: false, error, message, details }, { status });
}

async function sendWebhook(
  url: string,
  data: { phone: string; full_name: string; payload: Record<string, unknown> },
) {
  const lines = [
    `🆕 **Phiếu set-up chatbot mới**`,
    `👤 ${data.full_name} · ${data.phone}`,
    ...Object.entries(data.payload).map(([k, v]) => {
      const field = LEAD_FIELD_BY_KEY[k];
      const label = LEAD_FIELD_LABELS[k] ?? k;
      const text = field ? formatLeadValue(field, v) : String(v);
      // Repeater nhiều dòng → xuống dòng cho dễ đọc
      return text.includes('\n') ? `• ${label}:\n${text}` : `• ${label}: ${text}`;
    }),
  ];

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: lines.join('\n'), data }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      console.error(`[infor webhook] HTTP ${res.status}`, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('[infor webhook] dispatch failed', err);
  }
}
