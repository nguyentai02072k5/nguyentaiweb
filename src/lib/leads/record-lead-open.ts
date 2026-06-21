/**
 * record-lead-open.ts - Auto-fired khi khách MỞ link theo SĐT.
 *
 * Dùng cho cả infor.nguyenvantai.com/<sđt> (source 'infor-link') lẫn
 * form.nguyenvantai.com/<sđt> (source 'mooly-form'). Gọi từ Server Component,
 * tạo/đụng tới lead với status 'opened' NGAY khi khách mở link - để CMS biết
 * khách nào đã bấm vào. Idempotent theo (phone, source_group): mở lại chỉ tăng
 * open_count. `source` quyết định nhóm nguồn → lead vào đúng list CMS.
 *
 * Lỗi ghi nhận KHÔNG được chặn render trang (best-effort tracking).
 */

import 'server-only';
import { after } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import { hashIp, getClientIp } from '@/lib/security/ip-hash';
import { triggerLeadAutomation, toTriggerSource } from '@/lib/automation/trigger-lead-automation';

export type LeadOpenResult = {
  /** Lead đã từng submit chưa - dùng để prefill lại form nếu khách quay lại */
  alreadySubmitted: boolean;
  fullName: string | null;
  payload: Record<string, unknown>;
};

export async function recordLeadOpen(
  phone: string,
  headers: Headers,
  source: string = 'infor-link',
): Promise<LeadOpenResult | null> {
  let ipHash: string | null = null;
  try {
    ipHash = hashIp(getClientIp(headers));
  } catch {
    // IP_HASH_SALT thiếu - log, không chặn
    console.error(`[${source}] IP hash failed - open tracking continues without ip_hash`);
  }

  const { data, error } = await supabaseAdmin.rpc('record_lead_open', {
    p_phone: phone,
    p_user_agent: headers.get('user-agent') ?? undefined,
    p_ip_hash: ipHash ?? undefined,
    p_source: source,
  });

  if (error) {
    console.error(`[${source}] record_lead_open failed`, error);
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  // Auto-trigger flow automation Zalo khi khách mở link (fire-and-forget).
  // Worker dedup 10' nên không bắn trùng với lần submit sau đó.
  after(() => triggerLeadAutomation({ phone, name: row.full_name ?? '', source: toTriggerSource(source) }));

  return {
    alreadySubmitted: row.status === 'submitted',
    fullName: row.full_name ?? null,
    payload: (row.payload as Record<string, unknown>) ?? {},
  };
}
