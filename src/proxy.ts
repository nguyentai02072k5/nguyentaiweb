/**
 * proxy.ts - Routing + auth gate cho subdomain admin (Next.js 16 convention).
 *
 * 1. Host `admin.nguyenvantai.com` (hoặc `admin.localhost`) → rewrite vào `/admin/*`
 *    để main site (`/`, `/booking`, ...) không lộ qua subdomain.
 * 2. Tất cả route `/admin/*` (trừ `/admin/login` và Server Action POST của nó)
 *    yêu cầu cookie session hợp lệ - nếu không thì redirect về `/admin/login`.
 *
 * Lưu ý: dùng Web Crypto (SubtleCrypto) - Node `crypto` không có trong Edge runtime.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ADMIN_COOKIE_NAME = 'admin_session';
const ADMIN_HOST_PREFIX = 'admin.';
const INFOR_HOST_PREFIX = 'infor.';
const FORM_HOST_PREFIX = 'form.';
const WEBHOOK_HOST_PREFIX = 'webhook.';
const LANDING_HOST_PREFIX = 'landing.';
const COURSE_HOST_PREFIX = 'course.';

export const config = {
  matcher: [
    // Loại trừ asset Next + favicon / og để proxy không chạy thừa
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|og/).*)',
  ],
};

export async function proxy(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').toLowerCase();
  const url = request.nextUrl.clone();
  const isAdminHost = host.startsWith(ADMIN_HOST_PREFIX);
  const isInforHost = host.startsWith(INFOR_HOST_PREFIX);
  const isFormHost = host.startsWith(FORM_HOST_PREFIX);
  const isWebhookHost = host.startsWith(WEBHOOK_HOST_PREFIX);
  const isLandingHost = host.startsWith(LANDING_HOST_PREFIX);
  const isCourseHost = host.startsWith(COURSE_HOST_PREFIX);

  // ---- 0. Subdomain rewrite: infor.* → /infor/* (PUBLIC, không auth) ----
  // `infor.nguyenvantai.com/0901234567` → `/infor/0901234567` (giữ URL hiển thị).
  // Trang thu thập thông tin khách, ai có link cũng mở được.
  if (isInforHost && !url.pathname.startsWith('/infor') && !url.pathname.startsWith('/api')) {
    url.pathname = url.pathname === '/' ? '/infor' : `/infor${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // ---- 0b. Subdomain rewrite: form.* → /form/* (PUBLIC, không auth) ----
  // `form.nguyenvantai.com` → `/form` (form khai thác thông tin Bot Mooly).
  if (isFormHost && !url.pathname.startsWith('/form') && !url.pathname.startsWith('/api')) {
    url.pathname = url.pathname === '/' ? '/form' : `/form${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // ---- 0c. Subdomain rewrite: webhook.* → /webhook/* (PUBLIC, không auth) ----
  // `webhook.nguyenvantai.com` → `/webhook` (bảng điều khiển Zalo worker).
  if (isWebhookHost && !url.pathname.startsWith('/webhook') && !url.pathname.startsWith('/api')) {
    url.pathname = url.pathname === '/' ? '/webhook' : `/webhook${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // ---- 0d. Subdomain rewrite: landing.* → /landing/* (PUBLIC, không auth) ----
  // `landing.nguyenvantai.com` → `/landing` (marketing landing Mooly, pixel-match).
  if (isLandingHost && !url.pathname.startsWith('/landing') && !url.pathname.startsWith('/api')) {
    url.pathname = url.pathname === '/' ? '/landing' : `/landing${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // ---- 0e. Chặn /landing trên domain KHÔNG phải landing.* (tránh trùng nội dung/SEO) ----
  // Route nội bộ chỉ phục vụ qua subdomain landing → host khác gõ /landing = 404.
  // Chặn ĐÚNG segment /landing (không dính route tương lai như /landing-page).
  if (!isLandingHost && (url.pathname === '/landing' || url.pathname.startsWith('/landing/'))) {
    return new NextResponse(null, { status: 404 });
  }

  // ---- 0f. Subdomain rewrite: course.* → /course/* + cookie refresh ----
  // `course.nguyenvantai.com/` → `/course`, `course.*/ten-bai` → `/course/ten-bai`.
  // PUBLIC — KHÔNG gate, KHÔNG đụng admin HMAC.
  //
  // 3 việc proxy làm (plan invariant RT2-10):
  //   (1) Rewrite pathname: course.* → /course/*.
  //   (2) Refresh Supabase session cookie bằng getSession() — exchange refresh-token.
  //       KHÔNG dùng getUser() (HTTP round-trip đắt, để dành cho gate ở RSC).
  //       Đây là điểm DUY NHẤT ghi cookie refresh vì RSC không ghi được cookie.
  //   (3) Inject x-pathname để RSC đọc được path (RT-3).
  //
  // BỎ QUA /api hoàn toàn (RT2-10): mint API tự requireCourseUser(),
  // double round-trip ở đây chỉ tốn TTFB.
  if (isCourseHost) {
    // (RT2-10) Skip /api trước khi tạo bất kỳ client nào
    if (url.pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    // Rewrite pathname course.* → /course/*
    if (!url.pathname.startsWith('/course')) {
      url.pathname = url.pathname === '/' ? '/course' : `/course${url.pathname}`;
    }

    // Inject x-pathname cho RSC (RT-3)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', url.pathname);

    // Tạo response target để @supabase/ssr ghi cookie vào
    const response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });

    // Refresh session cookie (RT-2): getSession() exchange refresh-token nếu cần.
    // Residual RT2-11: @supabase/ssr Edge-compat chưa verify trên Vercel Edge thật.
    // Nếu gặp lỗi runtime Edge → cân nhắc chuyển proxy sang nodejs runtime (cold-start tăng).
    // Local next dev (Node) + Vercel Edge: spike bắt buộc trước P3 ship.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      try {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              // Forward cookie đã set/xoay sang response (RT-2)
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set({
                  name,
                  value,
                  ...options,
                  // Cookie flags bảo mật (RT2-7): mirror adminCookieOptions
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                  path: '/',
                });
              });
            },
          },
        });
        // getSession() = local JWT decode + refresh-token exchange nếu expired.
        // KHÔNG getUser() — không muốn HTTP round-trip mỗi navigation (RT2-10).
        await supabase.auth.getSession();
      } catch {
        // Lỗi refresh (env thiếu, mạng) → tiếp tục rewrite, không crash navigation.
      }
    }

    return response;
  }

  // ---- 0g. Chặn /course trên domain KHÔNG phải course.* (chống trùng SEO) ----
  // Route khu học tập chỉ phục vụ qua subdomain course.* → host khác gõ /course = 404.
  // Chặn ĐÚNG segment /course (không dính route tương lai như /course-detail).
  if (!isCourseHost && (url.pathname === '/course' || url.pathname.startsWith('/course/'))) {
    return new NextResponse(null, { status: 404 });
  }

  // ---- 1. Subdomain rewrite: admin.* → /admin/* ----
  // Nếu user gõ `admin.nguyenvantai.com/...` mà path chưa bắt đầu bằng /admin,
  // ta rewrite (giữ URL hiển thị) sang `/admin/...`.
  if (isAdminHost && !url.pathname.startsWith('/admin')) {
    url.pathname = url.pathname === '/' ? '/admin' : `/admin${url.pathname}`;
    return rewriteWithAuth(request, url);
  }

  // ---- 2. Auth gate cho mọi route /admin (cả main domain và subdomain) ----
  if (url.pathname.startsWith('/admin')) {
    return rewriteWithAuth(request, url);
  }

  // Ngoài admin → pass-through
  return NextResponse.next();
}

async function rewriteWithAuth(request: NextRequest, targetUrl: URL): Promise<NextResponse> {
  const pathname = targetUrl.pathname;
  const isLoginPath = pathname === '/admin/login';

  // Login page và Server Action của nó không cần auth
  if (isLoginPath) {
    return NextResponse.rewrite(targetUrl);
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const valid = await verifySessionTokenEdge(token);

  if (!valid) {
    const loginUrl = new URL('/admin/login', targetUrl);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.rewrite(targetUrl);
}

// ---------------------------------------------------------------------------
// Edge-safe HMAC verify (Web Crypto). Đồng bộ thuật toán với lib/admin/session.ts.
// ---------------------------------------------------------------------------

async function verifySessionTokenEdge(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const idx = token.indexOf('.');
  if (idx <= 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) return false;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signed = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(payload),
    );
    const expectedHex = bufferToHex(signed);
    return timingSafeEqualHex(expectedHex, sig);
  } catch {
    return false;
  }
}

function bufferToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
