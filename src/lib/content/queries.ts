/**
 * queries.ts - Truy vấn content layer (Velite output qua alias #site/content).
 *
 * Mọi truy cập template từ UI đi qua đây (sort/filter/relate) - DRY, 1 nguồn.
 *
 * Listing/grid/related trả `TemplateSummary` (BỎ `body`): card + filter không cần
 * MDX body, tránh serialize toàn bộ body compiled vào HTML trang kho (phình to khi
 * có hàng tá template). Chỉ trang chi tiết (getTemplateBySlug) mới cần body đầy đủ.
 */

import { templates, posts, type Template, type Post } from '#site/content';
import { INDUSTRIES } from './taxonomy';

/** Template không kèm body - đủ cho card/listing/filter. */
export type TemplateSummary = Omit<Template, 'body'>;
/** Post không kèm body - đủ cho card/listing. */
export type PostSummary = Omit<Post, 'body'>;

function toSummary(t: Template): TemplateSummary {
  const rest: Partial<Template> = { ...t };
  delete rest.body;
  return rest as TemplateSummary;
}

function toPostSummary(p: Post): PostSummary {
  const rest: Partial<Post> = { ...p };
  delete rest.body;
  return rest as PostSummary;
}

/** Sort: featured trước → mới nhất (publishedAt desc). */
function sortTemplates(list: Template[]): Template[] {
  return [...list].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.publishedAt.localeCompare(a.publishedAt);
  });
}

export function getTemplates(): TemplateSummary[] {
  return sortTemplates(templates).map(toSummary);
}

/** Bản đầy đủ (có body) cho trang chi tiết. */
export function getTemplateBySlug(slug: string): Template | undefined {
  return templates.find((t) => t.slug === slug);
}

/** Template của 1 ngành (pSEO route) - summary cho grid. */
export function getTemplatesByIndustry(industry: string): TemplateSummary[] {
  return sortTemplates(templates.filter((t) => t.industry === industry)).map(
    toSummary,
  );
}

/** Các ngành ĐÃ có ≥1 template - dùng cho generateStaticParams pSEO (chống thin content). */
export function getIndustriesWithTemplates() {
  const used = new Set(templates.map((t) => t.industry));
  return INDUSTRIES.filter((i) => used.has(i.slug));
}

/**
 * Related: cùng industry → bù cùng businessModel → bù featured. Loại bản thân, tối đa `limit`.
 * Nhận current dạng summary (đủ field cần) - trả summary cho card.
 */
export function getRelatedTemplates(
  current: TemplateSummary,
  limit = 3,
): TemplateSummary[] {
  const pool = templates.filter((t) => t.slug !== current.slug);
  const seen = new Set<string>();
  const result: Template[] = [];

  const pushUnique = (items: Template[]) => {
    for (const t of items) {
      if (result.length >= limit) break;
      if (seen.has(t.slug)) continue;
      seen.add(t.slug);
      result.push(t);
    }
  };

  pushUnique(sortTemplates(pool.filter((t) => t.industry === current.industry)));
  pushUnique(
    sortTemplates(pool.filter((t) => t.businessModel === current.businessModel)),
  );
  pushUnique(sortTemplates(pool.filter((t) => t.featured)));

  return result.slice(0, limit).map(toSummary);
}

// --- Blog posts ---

function sortPosts(list: Post[]): Post[] {
  return [...list].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Bài đã publish (loại draft), mới nhất trước. */
export function getPosts(): PostSummary[] {
  return sortPosts(posts.filter((p) => !p.draft)).map(toPostSummary);
}

/** Bản đầy đủ (có body) cho trang chi tiết. Draft → undefined (404). */
export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug && !p.draft);
}

/** Tag duy nhất từ bài đã publish (sort theo tần suất). */
export function getPostTags(): string[] {
  const count = new Map<string, number>();
  for (const p of posts) {
    if (p.draft) continue;
    for (const tag of p.tags) count.set(tag, (count.get(tag) ?? 0) + 1);
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

/** Related: nhiều tag chung trước → mới nhất. Loại bản thân + draft. */
export function getRelatedPosts(
  current: PostSummary,
  limit = 3,
): PostSummary[] {
  const pool = posts.filter((p) => !p.draft && p.slug !== current.slug);
  const scored = pool.map((p) => ({
    p,
    score: p.tags.filter((t) => current.tags.includes(t)).length,
  }));
  return scored
    .filter((s) => s.score > 0) // chỉ bài có tag chung (đúng spec; rỗng → ẩn section)
    .sort(
      (a, b) =>
        b.score - a.score || b.p.publishedAt.localeCompare(a.p.publishedAt),
    )
    .slice(0, limit)
    .map((s) => toPostSummary(s.p));
}

export type { Template, Post };
