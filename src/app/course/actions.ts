'use server';

/**
 * actions.ts — Server Actions cho auth khu học tập /course.
 *
 * Tất cả action chạy server-side, không bypass được bằng client fake.
 * Throttle in-memory per-email + per-IP (RT2-9).
 * Residual đã biết: per-instance trên Vercel (scale > 1 instance → window riêng mỗi instance).
 * Mitigation bổ sung: Supabase project có rate-limit email ở tầng infra (quota dùng chung).
 */

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createSsrClient } from '@/lib/supabase/ssr-client';
import { safeNextPath } from '@/lib/course/safe-next-path';

// ---------------------------------------------------------------------------
// Throttle in-memory (RT2-9)
// ---------------------------------------------------------------------------

const THROTTLE_WINDOW_MS = 60_000; // 1 phút
const MAX_PER_EMAIL = 3;           // tối đa 3 lần/email/phút
const MAX_PER_IP = 10;             // tối đa 10 lần/IP/phút

// Host hợp lệ để dựng origin callback (chống host-header injection ở emailRedirectTo).
const ALLOWED_HOSTS = new Set([
  'course.nguyenvantai.com',
  'course.localhost:3001',
  'course.localhost',
]);

interface ThrottleEntry {
  count: number;
  windowStart: number;
}

const emailThrottle = new Map<string, ThrottleEntry>();
const ipThrottle = new Map<string, ThrottleEntry>();

function checkThrottle(map: Map<string, ThrottleEntry>, key: string, max: number): boolean {
  const now = Date.now();
  // Bound memory: dọn entry hết hạn khi map phình (chống Map lớn dần vô hạn theo đời process).
  if (map.size > 1000) {
    for (const [k, e] of map) {
      if (now - e.windowStart > THROTTLE_WINDOW_MS) map.delete(k);
    }
  }
  const entry = map.get(key);
  if (!entry || now - entry.windowStart > THROTTLE_WINDOW_MS) {
    map.set(key, { count: 1, windowStart: now });
    return true; // cho phép
  }
  if (entry.count >= max) return false; // chặn
  entry.count++;
  return true;
}

/** Lấy IP từ header Vercel/proxy (x-forwarded-for) hoặc fallback 'unknown'. */
function getClientIp(hdrs: Awaited<ReturnType<typeof headers>>): string {
  const xff = hdrs.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return 'unknown';
}

// ---------------------------------------------------------------------------
// sendMagicLink
// ---------------------------------------------------------------------------

export type SendMagicLinkResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Gửi magic-link đến email học viên.
 *
 * - Throttle per-email + per-IP (in-memory, residual: per-Vercel-instance).
 * - `shouldCreateUser: true` — đăng ký free, ai nhập email cũng tạo tài khoản (chủ đích).
 * - `emailRedirectTo` trỏ đến callback route đúng origin (course.localhost dev / course.nguyenvantai.com prod).
 * - `next` param được sanitise bằng safeNextPath() trước khi nhúng vào URL.
 */
export async function sendMagicLink(
  email: string,
  next: string | null,
): Promise<SendMagicLinkResult> {
  // Validate email cơ bản ở server (không dựa client-side)
  const emailTrimmed = (email ?? '').trim().toLowerCase();
  if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
    return { ok: false, error: 'Email không hợp lệ.' };
  }

  // Xác định origin course từ request headers — CHỈ chấp nhận host trong allow-list
  // (chống host-header injection: kẻ xấu spoof Host để magic-link trỏ domain lạ). RT2-9.
  const hdrs = await headers();
  const host = hdrs.get('host') ?? '';
  const isLocal = host.startsWith('course.localhost');
  const proto = hdrs.get('x-forwarded-proto') ?? (isLocal ? 'http' : 'https');
  const courseOrigin = ALLOWED_HOSTS.has(host)
    ? `${proto}://${host}`
    : 'https://course.nguyenvantai.com'; // fallback cứng, không tin host lạ

  // Throttle per-IP
  const ip = getClientIp(hdrs);
  if (!checkThrottle(ipThrottle, ip, MAX_PER_IP)) {
    return { ok: false, error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' };
  }

  // Throttle per-email
  if (!checkThrottle(emailThrottle, emailTrimmed, MAX_PER_EMAIL)) {
    return { ok: false, error: 'Email này đã được gửi link gần đây. Kiểm tra hộp thư hoặc thử lại sau ít phút.' };
  }

  // Sanitise next param (RT-12)
  const safePath = safeNextPath(next);
  const callbackUrl = `${courseOrigin}/auth/callback?next=${encodeURIComponent(safePath)}`;

  try {
    const supabase = await createSsrClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: emailTrimmed,
      options: {
        emailRedirectTo: callbackUrl,
        shouldCreateUser: true, // đăng ký free = ai nhập email đều tạo user (chủ đích, RT2-9)
      },
    });

    if (error) {
      // Không lộ chi tiết lỗi Supabase ra ngoài (tránh enumeration)
      console.error('[sendMagicLink] Supabase error:', error.message);
      return { ok: false, error: 'Không thể gửi email. Vui lòng thử lại.' };
    }

    return { ok: true };
  } catch (err) {
    console.error('[sendMagicLink] Unexpected error:', err);
    return { ok: false, error: 'Lỗi hệ thống. Vui lòng thử lại.' };
  }
}

// ---------------------------------------------------------------------------
// signOut
// ---------------------------------------------------------------------------

/**
 * Đăng xuất học viên: xoá session Supabase → xoá cookie → redirect về /course.
 * Gắn vào nút Đăng xuất ở CourseHeader (form action).
 */
export async function signOut(): Promise<never> {
  try {
    const supabase = await createSsrClient();
    await supabase.auth.signOut();
  } catch (err) {
    // Không crash nếu signOut fail (token đã hết hạn, v.v.) — tiếp tục redirect.
    console.error('[signOut] error:', err);
  }
  redirect('/');
}
