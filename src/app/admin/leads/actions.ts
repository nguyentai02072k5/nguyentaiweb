'use server';

/**
 * actions.ts - Server Action cho CMS leads.
 *
 * Xoá lead khỏi bảng `leads` bằng service-role client (bypass RLS).
 * Route /admin/* đã được proxy.ts chặn auth (cookie session) nên action này
 * chỉ chạy được khi admin đã đăng nhập.
 */

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/server-client';

export type DeleteLeadResult = { ok: boolean; error?: string };

export async function deleteLeadAction(id: string): Promise<DeleteLeadResult> {
  if (!id) return { ok: false, error: 'Thiếu id lead.' };

  const { error } = await supabaseAdmin.from('leads').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/leads');
  return { ok: true };
}
