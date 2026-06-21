import 'server-only';

// Gọi worker /api/flow/trigger (fire-and-forget) khi có lead mới vào.
// Worker tự tìm flow đang bật khớp `source` ('infor' | 'mooly') và chạy.
// Dùng trong after() ở các route lead để không chặn response.

export async function triggerLeadAutomation(input: {
  phone: string;
  name?: string;
  source: 'infor' | 'mooly';
}): Promise<void> {
  const base = process.env.ZALO_WORKER_URL || process.env.NEXT_PUBLIC_ZALO_WORKER_URL;
  const token = process.env.WORKER_API_TOKEN;
  if (!base) {
    console.warn('[automation] Bỏ qua trigger: thiếu ZALO_WORKER_URL/NEXT_PUBLIC_ZALO_WORKER_URL.');
    return;
  }
  try {
    const res = await fetch(`${base.replace(/\/+$/, '')}/api/flow/trigger`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(token ? { 'x-api-token': token } : {}) },
      body: JSON.stringify({ source: input.source, phone: input.phone, name: input.name ?? '' }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      console.error('[automation] trigger HTTP', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('[automation] trigger failed', err);
  }
}

// Map source nội bộ ('infor-link'/'infor-landing'/'mooly-form'...) → nhóm trigger.
export function toTriggerSource(internalSource: string): 'infor' | 'mooly' {
  return internalSource.startsWith('mooly') ? 'mooly' : 'infor';
}
