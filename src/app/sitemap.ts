import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo/site';
import {
  getIndustriesWithTemplates,
  getPosts,
  getTemplates,
} from '@/lib/content/queries';

/**
 * sitemap.xml — route tĩnh + pSEO ngành (có template) + chi tiết template.
 * Filtered view client của /templates không có URL nên không liệt kê.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: absoluteUrl('/templates'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    { url: absoluteUrl('/booking'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/privacy'), changeFrequency: 'yearly', priority: 0.3 },
    { url: absoluteUrl('/terms'), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const industryRoutes: MetadataRoute.Sitemap = getIndustriesWithTemplates().map(
    (i) => ({
      url: absoluteUrl(`/templates/nganh/${i.slug}`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }),
  );

  const templateRoutes: MetadataRoute.Sitemap = getTemplates().map((t) => ({
    url: absoluteUrl(`/templates/${t.slug}`),
    lastModified: new Date(t.updatedAt ?? t.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = getPosts().map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(p.updatedAt ?? p.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...industryRoutes, ...templateRoutes, ...postRoutes];
}
