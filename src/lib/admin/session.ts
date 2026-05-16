/**
 * admin/session.ts — Session token cho admin dashboard.
 *
 * Cơ chế đơn giản nhưng đủ an toàn cho v1:
 * - Token = `<expiresAt>.<HMAC-SHA256(expiresAt, secret)>`
 * - Lưu trong cookie httpOnly + Secure + SameSite=Lax
 * - Server verify HMAC + check expiry mỗi request
 *
 * Không dùng JWT để tránh thêm dependency. Không lưu DB vì v1 chỉ có 1 owner.
 */

import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 ngày
export const ADMIN_COOKIE_NAME = 'admin_session';

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('Missing or weak env: ADMIN_SESSION_SECRET (>=16 chars)');
  }
  return secret;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function createSessionToken(now: number = Date.now()): string {
  const secret = getSecret();
  const expiresAt = now + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const sig = sign(payload, secret);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null, now: number = Date.now()): boolean {
  if (!token || typeof token !== 'string') return false;
  const idx = token.indexOf('.');
  if (idx <= 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < now) return false;

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return false;
  }
  const expected = sign(payload, secret);
  if (expected.length !== sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'));
  } catch {
    return false;
  }
}

export function verifyAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 1) return false;
  if (typeof input !== 'string') return false;
  const a = Buffer.from(input, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function adminCookieOptions(maxAgeMs: number = SESSION_TTL_MS) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}
