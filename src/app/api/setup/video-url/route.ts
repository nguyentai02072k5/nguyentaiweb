/**
 * GET /api/setup/video-url?id=v01
 *
 * Ký URL video R2 cho LDP Setup. Trình duyệt chỉ gửi `id` công khai (v01…v12);
 * key/bucket nằm server-side nên không ai ký được object tuỳ ý hay dò bucket.
 * Rate-limit best-effort theo IP (in-memory, mỗi instance) — lớp chặn chính nên đặt
 * ở Cloudflare/Vercel WAF cho route này.
 */

import { NextResponse } from 'next/server';
import { signSetupVideo, SETUP_VIDEO_TTL_SECONDS } from '@/lib/setup/setup-r2';
import { getClientIp } from '@/lib/security/ip-hash';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 40;
const hits = new Map<string, { count: number; resetAt: number }>();

function isLimited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 2000) {
    for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
  }
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function GET(request: Request) {
  const ip = getClientIp(request.headers) ?? 'unknown';
  if (isLimited(ip)) {
    return NextResponse.json({ error: 'Thao tác quá nhanh, thử lại sau ít giây.' }, { status: 429 });
  }

  const id = new URL(request.url).searchParams.get('id') ?? '';
  if (!/^v\d{2}$/.test(id)) {
    return NextResponse.json({ error: 'Video không hợp lệ.' }, { status: 400 });
  }

  try {
    const url = await signSetupVideo(id);
    if (!url) return NextResponse.json({ error: 'Không tìm thấy video.' }, { status: 404 });
    return NextResponse.json(
      { url, expiresIn: SETUP_VIDEO_TTL_SECONDS },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[setup video-url] sign failed', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Không tải được video, thử lại sau.' }, { status: 500 });
  }
}
