import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, defineCollection, s } from 'velite';
import {
  BUSINESS_MODEL_SLUGS,
  industryBelongsToModel,
} from './src/lib/content/taxonomy';
import { BLOG_CATEGORY_VALUES } from './src/lib/content/blog-taxonomy';

/**
 * Đếm số file .mdx nguồn trong content/<dir>.
 * Velite 0.3.1 ÂM THẦM bỏ doc sai schema và vẫn exit 0 (kể cả --strict) → một template
 * phân loại sai sẽ biến mất khỏi site mà CI vẫn xanh. Dùng để đối chiếu trong prepare().
 */
function countSourceMdx(dir: string): number {
  try {
    return readdirSync(join('content', dir), { recursive: true }).filter(
      (f): f is string => typeof f === 'string' && f.endsWith('.mdx'),
    ).length;
  } catch {
    return 0;
  }
}

/**
 * velite.config.ts — Content layer cho Template Instruction + Blog.
 *
 * Build: `velite && next build` (script tường minh — Turbopack KHÔNG dùng webpack plugin).
 * Schema viết bằng `s` của velite (zod-based, KHÔNG import `z` của project — velite bundle zod riêng).
 * Output `.velite/` (git-ignored) → import qua alias `#site/content`.
 * Ảnh cover để thẳng trong `public/templates/<slug>/` (KHÔNG dùng s.image() → tránh sharp coupling).
 */

const templates = defineCollection({
  name: 'Template',
  pattern: 'templates/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      description: s.string().max(300),
      businessModel: s.enum(BUSINESS_MODEL_SLUGS),
      industry: s.string(),
      tags: s.array(s.string()).default([]),
      cover: s.string().optional(),
      attachments: s
        .array(s.object({ label: s.string(), href: s.string() }))
        .optional(),
      featured: s.boolean().default(false),
      // JSON-LD: mặc định TechArticle; chỉ HowTo khi khai báo tường minh + có steps.
      schemaType: s.enum(['article', 'howto']).default('article'),
      publishedAt: s.isodate(),
      updatedAt: s.isodate().optional(),
      path: s.path(),
      body: s.mdx(),
    })
    // Cross-field: industry phải thuộc đúng businessModel (chống typo / sai phân loại).
    .refine((data) => industryBelongsToModel(data.industry, data.businessModel), {
      message: 'industry không thuộc businessModel đã chọn (xem src/lib/content/taxonomy.ts)',
      path: ['industry'],
    })
    .transform((data) => {
      const slug = data.path.replace(/^templates\//, '');
      return { ...data, slug, url: `/templates/${slug}` };
    }),
});

const posts = defineCollection({
  name: 'Post',
  pattern: 'blog/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      description: s.string().max(300),
      tags: s.array(s.enum(BLOG_CATEGORY_VALUES)).min(1), // chủ đề cố định, ≥1
      cover: s.string().optional(),
      author: s.string().optional(),
      draft: s.boolean().default(false),
      publishedAt: s.isodate(),
      updatedAt: s.isodate().optional(),
      metadata: s.metadata(), // { readingTime, wordCount } tính từ raw content
      path: s.path(),
      body: s.mdx(),
    })
    .transform((data) => {
      const slug = data.path.replace(/^blog\//, '');
      return { ...data, slug, url: `/blog/${slug}` };
    }),
});

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { templates, posts },
  // Build phải FAIL nếu bất kỳ .mdx nào bị loại do frontmatter sai (velite không tự fail).
  prepare: (data) => {
    const checks: Array<[string, number]> = [
      ['templates', data.templates.length],
      ['blog', data.posts.length],
    ];
    for (const [dir, resolved] of checks) {
      const source = countSourceMdx(dir);
      if (resolved !== source) {
        throw new Error(
          `[velite] content/${dir}: ${source} file .mdx nhưng chỉ ${resolved} hợp lệ — ` +
            `${source - resolved} file bị loại do frontmatter sai. Sửa theo content/templates/README.md.`,
        );
      }
    }
  },
});
