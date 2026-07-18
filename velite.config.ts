import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, defineCollection, s } from 'velite';
import {
  BUSINESS_MODEL_SLUGS,
  industryBelongsToModel,
} from './src/lib/content/taxonomy';
import { BLOG_CATEGORY_VALUES } from './src/lib/content/blog-taxonomy';

// ---------------------------------------------------------------------------
// Course collection schema
// ---------------------------------------------------------------------------

const courses = defineCollection({
  name: 'Course',
  pattern: 'courses/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(120),
      description: s.string().max(300),
      level: s.enum(['co-ban', 'nang-cao']),
      order: s.number(),
      instructor: s.object({
        name: s.string(),
        title: s.string().optional(),
      }),
      featured: s.boolean().default(false),
      durationLabel: s.string().optional(),
      publishedAt: s.isodate(),
      updatedAt: s.isodate().optional(),
      modules: s.array(
        s.object({
          title: s.string(),
          lessons: s.array(
            s.object({
              slug: s.string(),
              title: s.string(),
              duration: s.string().optional(),
              // RT-8: videoKey bắt buộc min(1) — chặn placeholder rỗng lọt build.
              videoKey: s.string().min(1),
              free: s.boolean().default(false),
            }),
          ),
        }),
      ),
      path: s.path(),
      body: s.mdx(),
    })
    .transform((data) => {
      const slug = data.path.replace(/^courses\//, '');
      // Tính tổng số bài học trong mọi module
      const lessonCount = data.modules.reduce(
        (acc, mod) => acc + mod.lessons.length,
        0,
      );
      // Lấy slug bài đầu tiên (module đầu, lesson đầu)
      const firstLessonSlug = data.modules[0]?.lessons[0]?.slug ?? '';
      const firstLessonHref = `/course/learn/${slug}/${firstLessonSlug}`;
      return { ...data, slug, lessonCount, firstLessonHref };
    }),
});

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
 * velite.config.ts - Content layer cho Template Instruction + Blog.
 *
 * Build: `velite && next build` (script tường minh - Turbopack KHÔNG dùng webpack plugin).
 * Schema viết bằng `s` của velite (zod-based, KHÔNG import `z` của project - velite bundle zod riêng).
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
      // FAQ (tuỳ chọn) → render section + FAQPage JSON-LD (tín hiệu AEO/rich result).
      faqs: s
        .array(s.object({ question: s.string(), answer: s.string() }))
        .optional(),
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
  collections: { templates, posts, courses },
  // Build phải FAIL nếu bất kỳ .mdx nào bị loại do frontmatter sai (velite không tự fail).
  prepare: (data) => {
    const checks: Array<[string, number]> = [
      ['templates', data.templates.length],
      ['blog', data.posts.length],
      ['courses', data.courses.length],
    ];
    for (const [dir, resolved] of checks) {
      const source = countSourceMdx(dir);
      if (resolved !== source) {
        throw new Error(
          `[velite] content/${dir}: ${source} file .mdx nhưng chỉ ${resolved} hợp lệ - ` +
            `${source - resolved} file bị loại do frontmatter sai. Sửa theo content/templates/README.md.`,
        );
      }
    }

    // RT2-15: Kiểm tra lesson.slug TRÙNG trong cùng 1 khoá (phá anchor content-model + progress map P4).
    for (const course of data.courses) {
      const seen = new Set<string>();
      for (const mod of course.modules) {
        for (const lesson of mod.lessons) {
          if (seen.has(lesson.slug)) {
            throw new Error(
              `[velite] courses/${course.slug}: lesson slug "${lesson.slug}" bị trùng trong khoá "${course.title}". ` +
                `Mỗi lesson.slug phải duy nhất trong 1 khoá (dùng cho anchor URL + progress tracking).`,
            );
          }
          seen.add(lesson.slug);
        }
      }
    }
  },
});
