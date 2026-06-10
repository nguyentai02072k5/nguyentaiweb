/**
 * blog-taxonomy.ts - 3 chủ đề (category) cố định cho blog. SSOT.
 * Tag của mỗi bài phải thuộc danh sách này (enforce trong velite.config → build fail nếu sai).
 */
export const BLOG_CATEGORIES = [
  'Phát triển kinh doanh',
  'Phát triển bản thân',
  'Phân tích trên thế gian',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/** Tuple cho velite s.enum(). */
export const BLOG_CATEGORY_VALUES = [...BLOG_CATEGORIES] as [
  BlogCategory,
  ...BlogCategory[],
];
