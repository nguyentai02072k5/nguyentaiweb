/**
 * server-client.ts - Service-role Supabase client.
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
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database-types';

type AdminClient = SupabaseClient<Database>;

// Lazy singleton. Env is validated on first real use (request time), NOT at
// module evaluation. This is critical: Next.js imports every route module
// during `next build` ("collect page data"). Validating env at the top level
// would throw and crash the whole build whenever a var is absent at build
// time, even though these routes are `force-dynamic` and only ever hit env at
// request time. Deferring construction lets the build succeed and surfaces a
// clear error only if a var is genuinely missing when a request runs.
let cachedClient: AdminClient | null = null;

function createAdminClient(): AdminClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!serviceRoleKey) {
    throw new Error('Missing env: SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { 'x-app': 'tai-landing-server' },
    },
  });
}

function getAdminClient(): AdminClient {
  if (!cachedClient) {
    cachedClient = createAdminClient();
  }
  return cachedClient;
}

// Proxy forwards every property access to the lazily-created client, so all
// existing `supabaseAdmin.from(...)` call sites keep working unchanged while
// construction is deferred until the first access.
export const supabaseAdmin: AdminClient = new Proxy({} as AdminClient, {
  get(_target, prop, receiver) {
    const client = getAdminClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
