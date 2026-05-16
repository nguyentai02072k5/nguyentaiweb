/**
 * proxy.ts — Routing + auth gate cho subdomain admin.
 *
 * 1. Host `admin.nguyenvantai.com` (hoặc `admin.localhost`) → rewrite vào `/admin/*`
 *    để main site (`/`, `/booking`, ...) không lộ qua subdomain.
 * 2. Tất cả route `/admin/*` (trừ `/admin/login` và Server Action POST của nó)
 *    yêu cầu cookie session hợp lệ — nếu không thì redirect về `/admin/login`.
 *
 * Lưu ý: dùng Web Crypto (SubtleCrypto) — Node `crypto` không có trong Edge runtime.
 */

import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'admin_session';
const ADMIN_HOST_PREFIX = 'admin.';

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
