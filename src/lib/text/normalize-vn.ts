/**
 * normalize-vn.ts - Bỏ dấu tiếng Việt + lowercase để search không dấu
 * (vd "my pham" khớp "Mỹ Phẩm"). Dùng chung cho filter template + blog.
 */
export function normalizeVN(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}
