/**
 * course-queries.ts — Truy vấn Velite collection `courses`.
 *
 * Mọi truy cập khoá học từ UI đi qua đây (sort/filter). DRY, 1 nguồn.
 * Listing/grid trả `CourseSummary` (BỎ `body`): tránh serialize toàn bộ
 * MDX compiled vào HTML trang landing (phình to với 6+ khoá).
 * Chỉ trang nội dung chi tiết (P3) mới cần body đầy đủ.
 *
 * Mirror pattern queries.ts (templates/posts).
 */

import { courses, type Course } from '#site/content';

/** Course không kèm body — đủ cho landing/listing. */
export type CourseSummary = Omit<Course, 'body'>;

function toCourseSummary(c: Course): CourseSummary {
  const rest: Partial<Course> = { ...c };
  delete rest.body;
  return rest as CourseSummary;
}

/**
 * Lấy tất cả khoá: sort order tăng dần, bù bằng publishedAt desc.
 * Trả summary (không kèm body).
 */
export function getCourses(): CourseSummary[] {
  return [...courses]
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return b.publishedAt.localeCompare(a.publishedAt);
    })
    .map(toCourseSummary);
}

/** Khoá featured — dùng cho hero/highlight nếu cần sau này. */
export function getFeaturedCourses(): CourseSummary[] {
  return getCourses().filter((c) => c.featured);
}

export type { Course };
