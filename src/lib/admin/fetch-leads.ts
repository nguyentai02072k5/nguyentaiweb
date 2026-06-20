/**
 * fetch-leads.ts - Server-side đọc danh sách lead cho CMS admin.
 * Service-role client (bypass RLS). Đọc tối đa 200 lead gần nhất.
 */

import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import type { Tables } from '@/lib/supabase/database-types';

export type LeadRow = Tables<'leads'>;

export type LeadStatusFilter =
  | 'all'
  | 'opened'
  | 'submitted'
  | 'contacted'
  | 'converted'
  | 'spam'
  | 'archived';

export async function fetchLeads({
  status = 'all',
  search,
}: {
  status?: LeadStatusFilter;
  search?: string;
}): Promise<{ data: LeadRow[]; error: string | null }> {
  let query = supabaseAdmin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (status !== 'all') {
    query = query.eq('status', status);
  }
  if (search?.trim()) {
    const q = search.trim();
    query = query.or(`phone.ilike.%${q}%,full_name.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    return { data: [], error: error.message };
  }
  return { data: (data ?? []) as LeadRow[], error: null };
}

export function computeLeadStats(rows: LeadRow[]) {
  return {
    total: rows.length,
    opened: rows.filter((r) => r.status === 'opened').length,
    submitted: rows.filter((r) => r.status === 'submitted').length,
    contacted: rows.filter((r) => r.status === 'contacted').length,
    converted: rows.filter((r) => r.status === 'converted').length,
  };
}
