/**
 * site.ts — Single source of truth cho site URL + danh tính.
 * Dùng chung: metadataBase (layout), sitemap, robots, JSON-LD, OG.
 */

const RAW_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://nguyenvantai.com'
).trim();

// Đảm bảo có protocol (env thiếu https:// sẽ làm new URL() crash toàn site) + bỏ trailing slash.
export const SITE_URL = (
  /^https?:\/\//i.test(RAW_SITE_URL) ? RAW_SITE_URL : `https://${RAW_SITE_URL}`
).replace(/\/$/, '');

export const SITE_NAME = 'Tài AI Automation';

export const SITE_AUTHOR = {
  name: 'Nguyễn Văn Tài',
  url: SITE_URL,
};

/** Ghép URL tuyệt đối từ path tương đối. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
