'use server';

// Server Actions cho automation flow. Route /admin/* đã được proxy.ts gác auth,
// dùng service-role client (bypass RLS).

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/server-client';
import type { Json } from '@/lib/supabase/database-types';
import type { AutomationFlow, FlowStep } from './flow-types';

const TABLE = 'automation_flows';

export async function listFlows(): Promise<AutomationFlow[]> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AutomationFlow[];
}

export async function getFlow(id: string): Promise<AutomationFlow | null> {
  const { data, error } = await supabaseAdmin.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as AutomationFlow) ?? null;
}

export async function createFlow(name: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .insert({ name: name?.trim() || 'Flow mới', enabled: false, steps: [] })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/automation');
  return { ok: true, id: data.id };
}

export async function saveFlow(flow: {
  id: string;
  name: string;
  enabled: boolean;
  trigger_source: string | null;
  steps: FlowStep[];
}): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .update({
      name: flow.name?.trim() || 'Flow mới',
      enabled: flow.enabled,
      trigger_source: flow.trigger_source || null,
      steps: (flow.steps ?? []) as unknown as Json,
      updated_at: new Date().toISOString(),
    })
    .eq('id', flow.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/automation');
  revalidatePath(`/admin/automation/${flow.id}`);
  return { ok: true };
}

export async function deleteFlow(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/automation');
  return { ok: true };
}

// Chạy thử flow: gọi worker /api/flow/trigger.
export async function testTriggerFlow(input: {
  flowId: string;
  phone: string;
  name?: string;
  linkMeet?: string;
}): Promise<{ ok: boolean; error?: string; result?: unknown }> {
  const base = process.env.ZALO_WORKER_URL || process.env.NEXT_PUBLIC_ZALO_WORKER_URL;
  const token = process.env.WORKER_API_TOKEN;
  if (!base) return { ok: false, error: 'Chưa cấu hình ZALO_WORKER_URL / NEXT_PUBLIC_ZALO_WORKER_URL.' };
  if (!input.phone) return { ok: false, error: 'Thiếu số điện thoại.' };

  try {
    const res = await fetch(`${base.replace(/\/+$/, '')}/api/flow/trigger`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { 'x-api-token': token } : {}),
      },
      body: JSON.stringify({
        flowId: input.flowId,
        phone: input.phone,
        name: input.name ?? '',
        vars: input.linkMeet ? { link_meet: input.linkMeet } : {},
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return { ok: true, result: json };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
