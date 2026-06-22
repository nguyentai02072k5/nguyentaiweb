/**
 * handle-lead-doc-upload.ts - Logic dùng chung cho chế độ "đã có sẵn tài liệu".
 *
 * Cả phiếu infor (/api/infor/upload) lẫn form Mooly (/api/form/upload) đều cho
 * khách đính kèm 1 file (mô tả DN + quy trình bán hàng) thay vì điền tay. Chỉ
 * khác `source` để admin CMS phân biệt nguồn → tách logic ra đây cho DRY.
 *
 * Flow (KISS):
 *   1. Parse multipart: phone, full_name, file
 *   2. Normalize VN phone + validate tên + validate file (<= 2MB, có nội dung)
 *   3. Upload → bucket private 'lead-docs', path theo SĐT
 *   4. Signed URL dài hạn (1 năm) để admin mở lại trong CMS
 *   5. RPC submit_lead - upsert theo SĐT, payload = { business_doc_* }
 *   6. Webhook fire-and-forget (báo lead mới kèm link file)
 */

import { NextResponse, after } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import { normalizeVnPhone, maskVnPhone } from '@/lib/format/phone-vn';
import { hashIp, getClientIp } from '@/lib/security/ip-hash';
import type { Json } from '@/lib/supabase/database-types';

const BUCKET = 'lead-docs';
const MAX_BYTES = 2 * 1024 * 1024; // 2MB - khớp file_size_limit của bucket
const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 1 năm

/** Xử lý 1 request upload tài liệu lead. `source` phân biệt nguồn (infor / mooly). */
export async function handleLeadDocUpload(request: Request, source: string): Promise<Response> {
  // ---- 1. Parse multipart ----
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError('validation', 'Body không hợp lệ', 400);
  }

  const rawPhone = String(form.get('phone') ?? '');
  const fullName = String(form.get('full_name') ?? '').trim();
  const file = form.get('file');

  // ---- 2. Validate ----
  const phone = normalizeVnPhone(rawPhone);
  if (!phone) {
    return jsonError('validation', 'Số điện thoại không đúng định dạng VN', 400);
  }
  if (fullName.length < 2) {
    return jsonError('validation', 'Vui lòng nhập họ và tên', 400);
  }
  if (!(file instanceof File) || file.size === 0) {
    return jsonError('validation', 'Vui lòng chọn file để upload', 400);
  }
  if (file.size > MAX_BYTES) {
    return jsonError('validation', 'File vượt quá 2MB', 400);
  }

  // ---- 3. Upload ----
  const objectPath = `${phone}/${crypto.randomUUID()}-${sanitizeName(file.name)}`;
  const { error: upErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(objectPath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (upErr) {
    console.error(`[${source}] storage upload error`, upErr);
    return jsonError('server', 'Tải file lên thất bại. Vui lòng thử lại.', 500);
  }

  // ---- 4. Signed URL dài hạn ----
  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(objectPath, SIGNED_URL_TTL);

  if (signErr || !signed?.signedUrl) {
    console.error(`[${source}] createSignedUrl error`, signErr);
    return jsonError('server', 'Không tạo được link file. Vui lòng thử lại.', 500);
  }

  // ---- 5. IP hash + RPC submit_lead ----
  let ipHash: string | null = null;
  try {
    ipHash = hashIp(getClientIp(request.headers));
  } catch {
    console.error(`[${source}] IP hash failed - continues without ip_hash`);
  }

  const payload = {
    business_doc_url: signed.signedUrl,
    business_doc_name: file.name,
  } satisfies Record<string, string>;

  const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('submit_lead', {
    p_phone: phone,
    p_full_name: fullName,
    p_payload: payload as Json,
    p_user_agent: request.headers.get('user-agent') ?? undefined,
    p_ip_hash: ipHash ?? undefined,
    p_source: source,
  });

  if (rpcError) {
    console.error(`[${source}] submit_lead RPC error`, rpcError);
    return jsonError('server', 'Hệ thống đang bận. Vui lòng thử lại sau.', 500);
  }

  const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!row?.id) {
    return jsonError('server', 'RPC trả về dữ liệu không hợp lệ', 500);
  }

  // ---- 6. Webhook ----
  const webhookUrl = process.env.LEADS_WEBHOOK_URL ?? process.env.WEBHOOK_URL;
  if (webhookUrl) {
    after(() =>
      sendWebhook(webhookUrl, {
        source,
        phone,
        full_name: fullName,
        doc_name: file.name,
        doc_url: signed.signedUrl,
      }),
    );
  }

  // ---- 7. Success ----
  return NextResponse.json(
    { success: true, lead_id: row.id, phone_mask: maskVnPhone(phone) },
    { status: 201 },
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Giữ tên file an toàn cho object key (bỏ ký tự lạ, gọn khoảng trắng). */
function sanitizeName(name: string): string {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(-80);
  return cleaned || 'file';
}

function jsonError(error: 'validation' | 'server', message: string, status: number) {
  return NextResponse.json({ success: false, error, message }, { status });
}

async function sendWebhook(
  url: string,
  data: { source: string; phone: string; full_name: string; doc_name: string; doc_url: string },
) {
  const title =
    data.source === 'mooly-form'
      ? '🆕 **Thông tin shop Mooly mới (qua file)**'
      : '🆕 **Phiếu set-up chatbot mới (qua file)**';
  const lines = [
    title,
    `👤 ${data.full_name} · ${data.phone}`,
    `📎 ${data.doc_name}`,
    `🔗 ${data.doc_url}`,
  ];

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: lines.join('\n'), data }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      console.error(`[${data.source} webhook] HTTP ${res.status}`, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error(`[${data.source} webhook] dispatch failed`, err);
  }
}
