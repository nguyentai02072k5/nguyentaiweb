/**
 * placeholder-utils.ts - Chọn ví dụ placeholder "mờ mờ" trong ô nhập.
 *
 * Deterministic (hash theo seed) để SSR == CSR, không gây hydration mismatch,
 * nhưng vẫn đa dạng: mỗi field/ô một ví dụ khác nhau, không cứng nhắc.
 */

function hashIndex(seed: string, len: number): number {
  if (len <= 0) return 0;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h % len;
}

/** Field đơn: chọn 1 ví dụ ổn định theo key. */
export function pickPlaceholder(list: string[] | undefined, seed: string): string | undefined {
  if (!list?.length) return undefined;
  return list[hashIndex(seed, list.length)];
}

/** Dòng repeater: xoay vòng theo index để mỗi dòng một ví dụ khác. */
export function rotatePlaceholder(list: string[] | undefined, index: number): string | undefined {
  if (!list?.length) return undefined;
  return list[index % list.length];
}
