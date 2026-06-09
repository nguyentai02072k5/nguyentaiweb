import type { MetadataRoute } from 'next';
import { SITE_URL, absoluteUrl } from '@/lib/seo/site';

/**
 * robots.txt — Cho index tất cả trừ khu admin + API. KHÔNG chặn /booking (trang chuyển đổi).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /admin + /api nội bộ; /brand /logo /components /animations là trang dev-verify, không index.
      disallow: ['/admin', '/api', '/brand', '/logo', '/components', '/animations'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
