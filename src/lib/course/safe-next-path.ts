/**
 * safe-next-path.ts — Validate + sanitise tham số `next` trong flow auth course.
 *
 * URL khu học tập course.* dùng PATH TRẦN (vd '/', '/dang-nhap', '/hoc/bai-1') —
 * proxy rewrite ngầm sang route nội bộ /course/*. Nên `next` là path trần same-origin.
 *
 * Chống open-redirect (RT-12):
 *   1. Phải là string truthy.
 *   2. Khớp `^/[^/\\]` — loại protocol-relative `//evil.com` và backslash `/\evil.com`.
 *   3. `new URL(next, base)` phải CÙNG origin với base — chặn control-char / encoded
 *      escape làm nhảy host (vd tab/newline bị URL parser strip thành `//host`).
 *   4. pathname phải bắt đầu đúng 1 dấu `/` (không `//`). Fail bất kỳ bước nào → `/`.
 *
 * Test tay:
 *   safeNextPath('//evil.com')       → '/'           reject double-slash
 *   safeNextPath('/\\evil.com')      → '/'           reject backslash
 *   safeNextPath('http://evil/')     → '/'           reject (không leading '/')
 *   safeNextPath('/dang-nhap')       → '/dang-nhap'  accept
 *   safeNextPath('/hoc/khoa/bai-1')  → '/hoc/khoa/bai-1'  accept (deep-link P3)
 *   safeNextPath('/')                → '/'           accept root
 *   safeNextPath(null)               → '/'           fallback
 */

const FALLBACK = '/';

/** Bước 2: path hợp lệ phải bắt đầu bằng `/` rồi ký tự KHÔNG phải `/` hoặc `\`. */
const SAFE_PATH_RE = /^\/[^/\\]/;

/**
 * Trả về path nội bộ course an toàn từ tham số `next`. Input đáng ngờ → `/`.
 *
 * @param next - Giá trị raw từ searchParams.get('next').
 * @param base - Origin để resolve + đối chiếu (mặc định course.localhost).
 */
export function safeNextPath(
  next: string | null | undefined,
  base = 'http://course.localhost',
): string {
  if (!next || typeof next !== 'string') return FALLBACK;

  // Bước 2: reject double-slash và backslash ngay từ chuỗi raw
  if (!SAFE_PATH_RE.test(next)) return FALLBACK;

  let resolved: URL;
  let baseUrl: URL;
  try {
    baseUrl = new URL(base);
    resolved = new URL(next, base);
  } catch {
    return FALLBACK;
  }

  // Bước 3: origin phải giữ nguyên (chặn escape nhảy host qua control-char/encoded)
  if (resolved.origin !== baseUrl.origin) return FALLBACK;

  // Bước 4: pathname phải là path trần 1 dấu '/' đầu
  const pathname = resolved.pathname;
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return FALLBACK;

  return pathname;
}
