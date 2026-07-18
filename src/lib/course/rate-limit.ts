/**
 * rate-limit.ts — Token-bucket in-memory cho mint API (RT2-8).
 *
 * ⚠️ RESIDUAL TRUNG THỰC (RT2-8): bucket này là **per-instance, reset mỗi cold
 * start**. Trên Vercel serverless nhiều instance, nó KHÔNG chặn farming
 * cross-instance — chỉ "best-effort per-instance". Đây là quyết định (a) trong
 * plan: nội dung FREE (đăng nhập = xem hết) nên URL 4h coi như public-cho-user-
 * đã-đăng-ký; tác hại giới hạn. KHÔNG được mô tả helper này như "chặn farming".
 * Nếu về sau cần cap thật → backing bằng shared store (Supabase counter / KV).
 *
 * Mục tiêu thực tế: chặn 1 client spam mint hàng trăm lần/giây trên CÙNG instance
 * (bug loop / abuse thô), không phải chống phân tán.
 */

import 'server-only';

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, Bucket>();

/** Sức chứa burst mặc định (số request tức thời cho phép). */
const DEFAULT_CAPACITY = 20;
/** Tốc độ hồi token (~30 request/phút ở trạng thái ổn định). */
const DEFAULT_REFILL_PER_SEC = 0.5;
/** Ngưỡng prune Map để không phình theo đời process. */
const PRUNE_SIZE = 5000;
const PRUNE_STALE_MS = 10 * 60_000;

/**
 * @returns true = cho phép; false = vượt hạn mức.
 */
export function checkRateLimit(
  key: string,
  capacity = DEFAULT_CAPACITY,
  refillPerSec = DEFAULT_REFILL_PER_SEC,
): boolean {
  const now = Date.now();

  // Bound memory: dọn entry cũ khi Map phình.
  if (buckets.size > PRUNE_SIZE) {
    for (const [k, b] of buckets) {
      if (now - b.updatedAt > PRUNE_STALE_MS) buckets.delete(k);
    }
  }

  const existing = buckets.get(key);
  if (!existing) {
    buckets.set(key, { tokens: capacity - 1, updatedAt: now });
    return true;
  }

  // Hồi token theo thời gian trôi qua.
  const elapsedSec = (now - existing.updatedAt) / 1000;
  existing.tokens = Math.min(capacity, existing.tokens + elapsedSec * refillPerSec);
  existing.updatedAt = now;

  if (existing.tokens < 1) return false;
  existing.tokens -= 1;
  return true;
}
