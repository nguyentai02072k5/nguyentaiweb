/**
 * POST /api/infor/capture
 *
 * Bước 1 landing /infor: khách nhấn "Xác Nhận Thông Tin" (Họ tên + SĐT + Email).
 * Ghi nhận lead NGAY (status 'submitted', email lưu trong payload) để không mất
 * lead nếu khách bỏ ngang form chi tiết. Bước 2 (config chatbot) sẽ enrich payload.
 *
 * Flow (KISS):
 *   1. Zod validate
 *   2. Normalize VN phone
 *   3. Hash IP (chống spam)
 *   4. RPC submit_lead - upsert theo SĐT, payload = { email }
 *   5. Webhook fire-and-forget (báo lead mới)
 */

import { NextResponse, after } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import { leadCaptureSchema } from '@/lib/leads/capture-schema';
import { normalizeVnPhone, maskVnPhone } from '@/lib/format/phone-vn';
import { hashIp, getClientIp } from '@/lib/security/ip-hash';
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

  const parsed = leadCaptureSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation', 'Thông tin chưa hợp lệ', 400, parsed.error.issues);
  }
  const data = parsed.data;

  // ---- 2. Phone normalize ----
  const phone = normalizeVnPhone(data.phone);
  if (!phone) {
    return jsonError('validation', 'Số điện thoại không đúng định dạng VN', 400);
  }

  // ---- 3. IP hash ----
  let ipHash: string | null = null;
  try {
    ipHash = hashIp(getClientIp(request.headers));
  } catch {
    console.error('[infor capture] IP hash failed - continues without ip_hash');
  }

  // ---- 4. RPC submit_lead (payload chỉ có email ở bước cơ bản) ----
  const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('submit_lead', {
    p_phone: phone,
    p_full_name: data.full_name,
    p_payload: { email: data.email } as Json,
    p_user_agent: request.headers.get('user-agent') ?? undefined,
    p_ip_hash: ipHash ?? undefined,
    p_source: 'infor-landing',
  });

  if (rpcError) {
    console.error('[infor capture] submit_lead RPC error', rpcError);
    return jsonError('server', 'Hệ thống đang bận. Vui lòng thử lại sau.', 500);
  }

  const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!row?.id) {
    return jsonError('server', 'RPC trả về dữ liệu không hợp lệ', 500);
  }

  // ---- 5. Webhook báo lead mới (fire-and-forget) ----
  const webhookUrl = process.env.LEADS_WEBHOOK_URL ?? process.env.WEBHOOK_URL;
  if (webhookUrl) {
    after(() =>
      sendCaptureWebhook(webhookUrl, { phone, full_name: data.full_name, email: data.email }),
    );
  }

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

async function sendCaptureWebhook(
  url: string,
  data: { phone: string; full_name: string; email: string },
) {
  const content = [
    '✨ **Lead mới (landing /infor)**',
    `👤 ${data.full_name} · ${data.phone}`,
    `✉️ ${data.email}`,
    '_Đã để lại thông tin cơ bản, chờ điền cấu hình chatbot._',
  ].join('\n');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content, data }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      console.error(`[infor capture webhook] HTTP ${res.status}`, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('[infor capture webhook] dispatch failed', err);
  }
}
