/**
 * server-client.ts — Service-role Supabase client.
 *
 * SECURITY-CRITICAL: `import 'server-only'` ensures Next.js throws at
 * build time if this module is imported from a Client Component or browser
 * code. Service role key bypasses RLS and must NEVER reach the client bundle.
 *
 * Use this client from Route Handlers, Server Components, and Server Actions
 * for booking writes + admin reads. v1 does not expose direct client-side
 * Supabase access; the browser calls Next.js API routes instead.
 */

import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database-types';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
}
if (!serviceRoleKey) {
  throw new Error('Missing env: SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient<Database>(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: { 'x-app': 'tai-landing-server' },
  },
});
