/**
 * ip-hash.ts — One-way IP hashing for spam detection without storing PII.
 *
 * Uses Node's `crypto.createHash` (server-only). Salt from `IP_HASH_SALT`
 * env — rotated per environment so hashes don't cross-correlate.
 */

import 'server-only';
import { createHash } from 'node:crypto';

/**
 * Hash an IP address with the env salt. Returns hex string.
 * Returns null if no IP is available (e.g. unknown forwarded header).
 */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT;
  if (!salt) {
    throw new Error('Missing env: IP_HASH_SALT');
  }
  return createHash('sha256').update(salt + ':' + ip).digest('hex');
}

/**
 * Extract client IP from a Next.js Request. Prefers `x-forwarded-for` first
 * entry (Vercel sets this). Falls back to `x-real-ip`. Returns null if none.
 */
export function getClientIp(headers: Headers): string | null {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip');
}
