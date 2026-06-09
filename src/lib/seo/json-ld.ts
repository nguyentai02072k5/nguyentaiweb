/**
 * json-ld.ts — Builders cho structured data (schema.org).
 *
 * Template detail: TechArticle (luôn hợp lệ). `schemaType: 'howto'` để DÀNH cho tương lai
 * — chỉ nên emit HowTo khi có `step[]` đúng cấu trúc (frontmatter chưa có field steps),
 * nên hiện tại luôn TechArticle để tránh markup HowTo thiếu step (Google bỏ qua, không lợi).
 */

import type { Post, Template } from '#site/content';
import type { TemplateSummary } from '@/lib/content/queries';
import { SITE_AUTHOR, SITE_NAME, absoluteUrl } from './site';

type JsonLd = Record<string, unknown>;

export function buildBreadcrumb(
  items: { name: string; path: string }[],
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function buildTemplateJsonLd(template: Template): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: template.title,
    description: template.description,
    url: absoluteUrl(template.url),
    mainEntityOfPage: absoluteUrl(template.url),
    image: absoluteUrl(`${template.url}/opengraph-image`),
    datePublished: template.publishedAt,
    dateModified: template.updatedAt ?? template.publishedAt,
    author: { '@type': 'Person', name: SITE_AUTHOR.name, url: SITE_AUTHOR.url },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
  };
}

export function buildBlogPostingJsonLd(post: Post): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: absoluteUrl(post.url),
    mainEntityOfPage: absoluteUrl(post.url),
    image: absoluteUrl(`${post.url}/opengraph-image`),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author ?? SITE_AUTHOR.name,
      url: SITE_AUTHOR.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
    keywords: post.tags.join(', '),
  };
}

export function buildCollectionJsonLd(
  name: string,
  path: string,
  items: TemplateSummary[],
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: absoluteUrl(path),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(t.url),
        name: t.title,
      })),
    },
  };
}
