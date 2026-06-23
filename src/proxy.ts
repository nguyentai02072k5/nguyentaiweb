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

const ADMIN_COOKIE_NAME = 'admin_session';
const ADMIN_HOST_PREFIX = 'admin.';
const INFOR_HOST_PREFIX = 'infor.';
const FORM_HOST_PREFIX = 'form.';
const WEBHOOK_HOST_PREFIX = 'webhook.';
const LANDING_HOST_PREFIX = 'landing.';

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
