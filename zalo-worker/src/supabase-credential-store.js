// Đọc/ghi credential Zalo (đã mã hóa) vào bảng public.zalo_credentials trên Supabase.

import { createClient } from "@supabase/supabase-js";
import { config, assertStoreConfig } from "./config.js";
import { encryptJson, decryptJson } from "./crypto-store.js";

const TABLE = "zalo_credentials";

let _client = null;
function getClient() {
  assertStoreConfig();
  if (!_client) {
    _client = createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

// creds = { cookie, imei, userAgent }
export async function saveCredentials(creds, displayName) {
  const enc_payload = encryptJson(creds);
  const { error } = await getClient()
    .from(TABLE)
    .upsert({
      id: config.credId,
      enc_payload,
      display_name: displayName ?? null,
      updated_at: new Date().toISOString(),
    });
  if (error) throw new Error(`Lưu credential lỗi: ${error.message}`);
}

export async function loadCredentials() {
  const { data, error } = await getClient()
    .from(TABLE)
    .select("enc_payload, display_name")
    .eq("id", config.credId)
    .maybeSingle();
  if (error) throw new Error(`Đọc credential lỗi: ${error.message}`);
  if (!data) return null;
  return { creds: decryptJson(data.enc_payload), displayName: data.display_name };
}

export async function clearCredentials() {
  const { error } = await getClient().from(TABLE).delete().eq("id", config.credId);
  if (error) throw new Error(`Xóa credential lỗi: ${error.message}`);
}
