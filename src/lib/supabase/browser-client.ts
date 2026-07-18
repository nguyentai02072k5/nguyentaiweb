/**
 * browser-client.ts — Supabase browser client (anon key only).
 *
 * Dùng trong Client Component (login-form) để gọi auth ở browser.
 * KHÔNG `import 'server-only'` — intentional: đây là client-side code.
 * Chỉ anon key được NEXT_PUBLIC_. Service-role KHÔNG bao giờ vào đây.
 *
 * Tách BIỆT hoàn toàn với:
 *   - server-client.ts  (service-role, bypass RLS — admin/booking)
 *   - ssr-client.ts     (createServerClient gắn cookie Next 16 — SSR/RSC/Action)
 */

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database-types';

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Trả singleton browser client cho Supabase Auth.
 * Lazy-init: env không cần hợp lệ lúc import (build time).
 * Gọi từ Client Component — React 19 strict mode an toàn.
 */
export function getBrowserClient(): SupabaseClient<Database> {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
  if (!anonKey) throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY');

  cachedClient = createBrowserClient<Database>(url, anonKey);
  return cachedClient;
}
