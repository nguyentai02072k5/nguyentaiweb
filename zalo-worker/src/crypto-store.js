// Mã hóa/giải mã credential bằng AES-256-GCM trước khi lưu Supabase.
// Định dạng lưu: base64( iv[12] | authTag[16] | ciphertext ).

import crypto from "node:crypto";
import { config } from "./config.js";

const ALGO = "aes-256-gcm";

function getKey() {
  const raw = config.encKey;
  // Nếu là 64 ký tự hex → dùng trực tiếp 32 byte. Ngược lại hash SHA-256 để ra đúng 32 byte.
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  return crypto.createHash("sha256").update(raw, "utf8").digest();
}

export function encryptJson(obj) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(obj), "utf8");
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptJson(b64) {
  const buf = Buffer.from(b64, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return JSON.parse(dec.toString("utf8"));
}
