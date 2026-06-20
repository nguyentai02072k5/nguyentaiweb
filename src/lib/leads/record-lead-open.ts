/**
 * record-lead-open.ts - Auto-fired khi khách MỞ link infor.nguyenvantai.com/<sđt>.
 *
 * Gọi từ Server Component của trang `/infor/[phone]` (server-only). Tạo/đụng tới
 * lead với status 'opened' NGAY khi khách mở link, trước cả khi điền gì - để CMS
 * biết khách nào đã bấm vào. Idempotent: mở lại link chỉ tăng open_count.
 *
 * Lỗi ghi nhận KHÔNG được chặn render trang (best-effort tracking).
 */

import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import { hashIp, getClientIp } from '@/lib/security/ip-hash';

export type LeadOpenResult = {
  /** Lead đã từng submit chưa - dùng để prefill lại form nếu khách quay lại */
  alreadySubmitted: boolean;
  fullName: string | null;
  payload: Record<string, unknown>;
};

export async function recordLeadOpen(
  phone: string,
  headers: Headers,
): Promise<LeadOpenResult | null> {
  let ipHash: string | null = null;
  try {
    ipHash = hashIp(getClientIp(headers));
  } catch {
    // IP_HASH_SALT thiếu - log, không chặn
    console.error('[infor] IP hash failed - open tracking continues without ip_hash');
  }

  const { data, error } = await supabaseAdmin.rpc('record_lead_open', {
    p_phone: phone,
    p_user_agent: headers.get('user-agent') ?? undefined,
    p_ip_hash: ipHash ?? undefined,
    p_source: 'infor-link',
  });

  if (error) {
    console.error('[infor] record_lead_open failed', error);
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    alreadySubmitted: row.status === 'submitted',
    fullName: row.full_name ?? null,
    payload: (row.payload as Record<string, unknown>) ?? {},
  };
}
