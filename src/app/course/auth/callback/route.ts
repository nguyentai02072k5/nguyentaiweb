/**
 * auth/callback/route.ts — Route Handler xử lý magic-link callback.
 *
 * Flow:
 *   1. Supabase redirect về `/auth/callback?code=<one-time-code>&next=<path>`
 *      (URL công khai path trần; proxy rewrite ngầm → route nội bộ /course/auth/callback)
 *   2. Dùng `exchangeCodeForSession(code)` đổi code lấy session (ghi cookie).
 *   3. Thành công → redirect(safeNext).
 *   4. Lỗi/expired/đã tiêu thụ (RT-14) → redirect về /course/dang-nhap?error=link-expired
 *      kèm next param để user không mất deep-link.
 *      KHÔNG để 500/loop.
 *
 * Callback route viết sẵn nhận `code` (OAuth-ready) để v1.1 bật Google OAuth
 * không cần sửa cấu trúc — chỉ thêm provider config.
 *
 * Cookie flags (RT2-7): do ssr-client.ts setAll enforce httpOnly/secure/sameSite=lax/path=/.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createSsrClient } from '@/lib/supabase/ssr-client';
import { safeNextPath } from '@/lib/course/safe-next-path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl;

  // Origin dựng từ Host header — KHÔNG dùng url.host: ở next dev, url.host có thể là
  // 'localhost:3001' (địa chỉ bind) thay vì 'course.localhost:3001' (Host thật) → redirect
  // rớt mất subdomain course. Lấy Host header giữ đúng origin người dùng đang đứng.
  const host = request.headers.get('host') ?? url.host;
  const proto = request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
  const origin = `${proto}://${host}`;

  const code = url.searchParams.get('code');
  const safePath = safeNextPath(url.searchParams.get('next'));

  // Redirect về trang đăng nhập kèm cờ link hết hạn (RT-14) — path trần.
  const toLogin = () =>
    NextResponse.redirect(
      new URL(`/dang-nhap?error=link-expired&next=${encodeURIComponent(safePath)}`, origin),
    );

  // Không có code → không phải callback hợp lệ (hoặc verify lỗi, code nằm ở hash)
  if (!code) return toLogin();

  try {
    const supabase = await createSsrClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Code đã dùng, hết hạn, hoặc prefetch bởi mail client (Outlook/Apple Mail) → RT-14
      console.error('[auth/callback] exchangeCodeForSession error:', error.message);
      return toLogin();
    }

    // Thành công — cookie đã set bởi ssr-client.ts setAll → về path an toàn (mặc định '/')
    return NextResponse.redirect(new URL(safePath, origin));
  } catch (err) {
    // Lỗi mạng / env → về trang đăng nhập, không 500
    console.error('[auth/callback] unexpected error:', err);
    return toLogin();
  }
}
