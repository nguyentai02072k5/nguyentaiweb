/**
 * ssr-client.ts — Supabase SSR client cho Route Handler / Server Action / proxy.
 *
 * `import 'server-only'` đảm bảo Next.js throw BUILD-TIME nếu module này bị
 * import từ Client Component hoặc browser code — guard không dựa grep thủ công.
 *
 * TÁCH BIỆT hoàn toàn với:
 *   - server-client.ts  (service-role key, bypass RLS — TUYỆT ĐỐI không dùng cho auth học viên)
 *   - browser-client.ts (createBrowserClient, không server-only)
 *
 * Cookie flags (RT2-7): mirror adminCookieOptions (src/lib/admin/session.ts:72-80)
 *   httpOnly: true, secure: prod only, sameSite: 'lax', path: '/'
 *
 * Cảnh báo RSC (RT-2): RSC KHÔNG ghi được cookie → setAll try/catch nuốt lỗi.
 * Điểm refresh THẬT duy nhất = proxy.ts nhánh course.* (gọi getSession()).
 * Server Action / Route Handler ghi cookie được bình thường.
 */

import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database-types';

/** Cookie flags mirror adminCookieOptions (lib/admin/session.ts:72-80) */
const COURSE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Tạo Supabase SSR client gắn với Next 16 cookie store (async).
 *
 * Dùng trong:
 *   - Route Handler (GET /course/auth/callback)
 *   - Server Action (sendMagicLink, signOut)
 *
 * KHÔNG dùng trực tiếp từ RSC trang — RSC dùng `createSsrClientForRSC()` bên dưới.
 */
export async function createSsrClient(): Promise<SupabaseClient<Database>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
  if (!anonKey) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY');

  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Route Handler + Server Action có thể ghi cookie → set bình thường.
        // RSC KHÔNG thể ghi cookie → try/catch nuốt lỗi (RT-2).
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...COURSE_COOKIE_OPTIONS,
              // Merge options từ SDK (maxAge, expires…) nhưng LUÔN override flags bảo mật
              ...options,
              httpOnly: COURSE_COOKIE_OPTIONS.httpOnly,
              secure: COURSE_COOKIE_OPTIONS.secure,
              sameSite: COURSE_COOKIE_OPTIONS.sameSite,
              path: COURSE_COOKIE_OPTIONS.path,
            });
          });
        } catch {
          // Bị gọi từ RSC (read-only cookie context) → bỏ qua.
          // Proxy course.* sẽ refresh cookie khi user navigate.
        }
      },
    },
  });
}
