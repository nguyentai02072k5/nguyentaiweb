/**
 * POST /api/landing/lead
 *
 * Form landing marketing Mooly (landing.nguyenvantai.com): Họ tên + SĐT/Zalo +
 * Ngành hàng + Lượng tin nhắn/ngày. Ghi lead NGAY (status 'submitted') vào hệ
 * thống infor — tái dùng RPC submit_lead + webhook + automation y như capture cũ.
 *
 * Khác capture: KHÔNG email; source 'infor-mooly-lp' (không prefix 'mooly' →
 * source_group GENERATED = 'infor' → gom chung tab infor, vẫn lọc tách được);
 * payload thêm industry + message_volume.
 *
 * Flow (KISS): zod → normalize phone → hash IP → submit_lead → webhook → automation.
 */

import { NextResponse, after } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import { landingLeadSchema } from '@/lib/leads/landing-lead-schema';
import { normalizeVnPhone, maskVnPhone } from '@/lib/format/phone-vn';
import { hashIp, getClientIp } from '@/lib/security/ip-hash';
import { triggerLeadAutomation } from '@/lib/automation/trigger-lead-automation';
import type { Json } from '@/lib/supabase/database-types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const LEAD_SOURCE = 'infor-mooly-lp';

export async function POST(request: Request) {
  // ---- 1. Parse + validate ----
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('validation', 'Body không hợp lệ', 400);
  }

  const parsed = landingLeadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('validation', 'Thông tin chưa hợp lệ', 400, parsed.error.issues);
  }
  const data = parsed.data;

  // ---- 2. Phone normalize ----
  const phone = normalizeVnPhone(data.phone);
  if (!phone) {
    return jsonError('validation', 'Số điện thoại không đúng định dạng VN', 400);
  }

  // ---- 3. IP hash (chống spam) ----
  let ipHash: string | null = null;
  try {
    ipHash = hashIp(getClientIp(request.headers));
  } catch {
    console.error('[landing lead] IP hash failed - continues without ip_hash');
  }

  // ---- 4. Payload: chỉ đưa key có giá trị (bỏ undefined/rỗng) ----
  const payload: Record<string, string> = {};
  if (data.industry) payload.industry = data.industry;
  if (data.message_volume) payload.message_volume = data.message_volume;

  // ---- 5. RPC submit_lead (upsert theo SĐT) ----
  const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('submit_lead', {
    p_phone: phone,
    p_full_name: data.full_name,
    p_payload: payload as Json,
    p_user_agent: request.headers.get('user-agent') ?? undefined,
    p_ip_hash: ipHash ?? undefined,
    p_source: LEAD_SOURCE,
  });

  if (rpcError) {
    console.error('[landing lead] submit_lead RPC error', rpcError);
    return jsonError('server', 'Hệ thống đang bận. Vui lòng thử lại sau.', 500);
  }

  const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!row?.id) {
    return jsonError('server', 'RPC trả về dữ liệu không hợp lệ', 500);
  }

  // ---- 6. Webhook báo lead mới (fire-and-forget) ----
  const webhookUrl = process.env.LEADS_WEBHOOK_URL ?? process.env.WEBHOOK_URL;
  if (webhookUrl) {
    after(() =>
      sendLandingWebhook(webhookUrl, {
        phone,
        full_name: data.full_name,
        industry: data.industry,
        message_volume: data.message_volume,
      }),
    );
  }

  // ---- 6b. Auto-trigger flow automation Zalo (fire-and-forget) ----
  after(() => triggerLeadAutomation({ phone, name: data.full_name, source: 'infor' }));

  // ---- 7. Success ----
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

async function sendLandingWebhook(
  url: string,
  data: { phone: string; full_name: string; industry?: string; message_volume?: string },
) {
  const lines = [
    '✨ **Lead mới (landing Mooly)**',
    `👤 ${data.full_name} · ${data.phone}`,
  ];
  if (data.industry) lines.push(`🏷️ Ngành hàng: ${data.industry}`);
  if (data.message_volume) lines.push(`💬 Lượng tin/ngày: ${data.message_volume}`);
  lines.push('_Để lại thông tin qua landing — chờ tư vấn._');
  const content = lines.join('\n');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content, data }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      console.error(`[landing lead webhook] HTTP ${res.status}`, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('[landing lead webhook] dispatch failed', err);
  }
}
