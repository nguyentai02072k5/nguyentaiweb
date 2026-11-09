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

// Chống quét SĐT hàng loạt: link mở theo SĐT nên bot chỉ cần lặp URL là sinh
// hàng nghìn lead rác và bắn automation Zalo tới số lạ.
const BOT_UA = /curl|wget|python|httpx|axios|node-fetch|go-http|java\/|okhttp|scrapy|bot\b|crawl|spider|headless|libwww|postman/i;
const MAX_NEW_LEADS_PER_IP = 20; // lead mới tối đa / IP / cửa sổ
const THROTTLE_WINDOW_MS = 10 * 60 * 1000;

function isBotUserAgent(userAgent: string | null): boolean {
  return !userAgent || BOT_UA.test(userAgent);
}

/** True khi IP này đã tạo quá nhiều lead mới trong cửa sổ gần đây. Lỗi query → không chặn. */
async function isIpThrottled(ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - THROTTLE_WINDOW_MS).toISOString();
  const { count, error } = await supabaseAdmin
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);
  if (error) {
    console.error('[lead-open] throttle check failed', error);
    return false;
  }
  return (count ?? 0) >= MAX_NEW_LEADS_PER_IP;
}

export async function recordLeadOpen(
  phone: string,
  headers: Headers,
  source: string = 'infor-link',
): Promise<LeadOpenResult | null> {
  // Bot/công cụ dòng lệnh: vẫn render trang, nhưng không ghi lead, không bắn automation.
  if (isBotUserAgent(headers.get('user-agent'))) {
    console.warn(`[${source}] bỏ qua ghi lead: user-agent bot/trống`);
    return null;
  }

  let ipHash: string | null = null;
  try {
    ipHash = hashIp(getClientIp(headers));
  } catch {
    // IP_HASH_SALT thiếu - log, không chặn
    console.error(`[${source}] IP hash failed - open tracking continues without ip_hash`);
  }

  if (ipHash && (await isIpThrottled(ipHash))) {
    console.warn(`[${source}] bỏ qua ghi lead: IP vượt ${MAX_NEW_LEADS_PER_IP} lead/10 phút`);
    return null;
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
