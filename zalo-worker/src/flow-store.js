// Đọc/ghi flow automation + run state trên Supabase (service_role).

import { createClient } from "@supabase/supabase-js";
import { config, assertStoreConfig } from "./config.js";

let _client = null;
function db() {
  assertStoreConfig();
  if (!_client) {
    _client = createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

// Lấy flow đang bật khớp nguồn (source). Ưu tiên flow có trigger_source = source,
// nếu không có thì lấy flow trigger_source null (mọi nguồn). Mới nhất trước.
export async function getActiveFlow(source) {
  const { data, error } = await db()
    .from("automation_flows")
    .select("*")
    .eq("enabled", true)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`Đọc flow lỗi: ${error.message}`);
  if (!data?.length) return null;
  return (
    data.find((f) => f.trigger_source === source) ||
    data.find((f) => !f.trigger_source) ||
    null
  );
}

export async function getFlowById(id) {
  const { data, error } = await db()
    .from("automation_flows")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Đọc flow lỗi: ${error.message}`);
  return data;
}

export async function createRun(flowId, context) {
  const { data, error } = await db()
    .from("automation_runs")
    .insert({ flow_id: flowId, status: "running", context: context ?? {}, current_step: 0 })
    .select()
    .single();
  if (error) throw new Error(`Tạo run lỗi: ${error.message}`);
  return data;
}

// Tra cứu lead theo SĐT để biết form đã điền hay chưa.
// source (tùy chọn): 'mooly' | 'infor' khớp cột source_group.
export async function getLeadByPhone(phone, source) {
  let q = db()
    .from("leads")
    .select("phone, full_name, status, submitted_at, source_group")
    .eq("phone", String(phone).trim());
  if (source) q = q.eq("source_group", source);
  const { data, error } = await q.order("updated_at", { ascending: false }).limit(1);
  if (error) throw new Error(`Tra cứu lead lỗi: ${error.message}`);
  return data?.[0] ?? null;
}

// Kiểm tra đã có run cho (flow, phone) trong N phút gần đây chưa (chống bắn trùng
// khi lead vừa open vừa submit). Date.now() ok trong Node worker.
export async function hasRecentRun(flowId, phone, minutes = 10) {
  const since = new Date(Date.now() - minutes * 60000).toISOString();
  const { data, error } = await db()
    .from("automation_runs")
    .select("id")
    .eq("flow_id", flowId)
    .eq("context->>phone", String(phone).trim())
    .gte("created_at", since)
    .limit(1);
  if (error) throw new Error(`Dedup check lỗi: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

export async function getRun(id) {
  const { data, error } = await db()
    .from("automation_runs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Đọc run lỗi: ${error.message}`);
  return data;
}

export async function updateRun(id, fields) {
  const { error } = await db()
    .from("automation_runs")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Cập nhật run lỗi: ${error.message}`);
}
