/**
 * course-lesson-queries.ts — Truy vấn chi tiết bài học cho khu học (P3).
 *
 * Tách khỏi course-queries.ts: file kia CỐ TÌNH bỏ `body` cho landing/listing
 * (tránh serialize MDX nặng). Khu học cần full Course (kèm body) + flatten
 * lessons để dựng sidebar, prev/next, và verify lesson tồn tại ở mint API.
 *
 * KHÔNG `server-only`: dữ liệu khoá là nội dung công khai (title, videoKey object
 * key), không phải secret. Video được bảo vệ ở tầng signed URL, không ở tầng key.
 */

import { courses, type Course } from '#site/content';

/** 1 bài học thô trong module (khớp schema velite). */
export type CourseLesson = Course['modules'][number]['lessons'][number];

/** Bài học đã "flatten" khỏi module — kèm ngữ cảnh điều hướng. */
export interface FlatLesson extends CourseLesson {
  /** Tên module chứa bài (hiển thị nhóm ở sidebar). */
  moduleTitle: string;
  /** Vị trí trong danh sách phẳng (0-based) — dùng cho prev/next. */
  index: number;
  /**
   * Đường dẫn điều hướng SẠCH (không prefix `/course`).
   * Trên `course.nguyenvantai.com`, proxy tự rewrite `/learn/...` → `/course/learn/...`.
   * Mirror convention CourseHeader (`/dang-nhap`).
   */
  href: string;
}

/** Lấy full khoá (kèm body MDX) theo slug. */
export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

/** Flatten mọi bài của khoá theo đúng thứ tự module → lesson. */
export function flattenLessons(course: Course): FlatLesson[] {
  const flat: FlatLesson[] = [];
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      flat.push({
        ...lesson,
        moduleTitle: mod.title,
        index: flat.length,
        href: `/learn/${course.slug}/${lesson.slug}`,
      });
    }
  }
  return flat;
}

/**
 * Tìm 1 bài trong khoá. Trả kèm khoá + bài đã flatten.
 * Dùng ở gate/page (render) và mint API (verify tồn tại + lấy videoKey).
 */
export function getLessonBySlug(
  courseSlug: string,
  lessonSlug: string,
): { course: Course; lesson: FlatLesson } | undefined {
  const course = getCourseBySlug(courseSlug);
  if (!course) return undefined;
  const lesson = flattenLessons(course).find((l) => l.slug === lessonSlug);
  if (!lesson) return undefined;
  return { course, lesson };
}

/**
 * Bài trước / bài sau theo thứ tự phẳng (vượt ranh giới module).
 * Trả null ở đầu/cuối khoá.
 */
export function getAdjacentLessons(
  course: Course,
  lessonSlug: string,
): { prev: FlatLesson | null; next: FlatLesson | null } {
  const flat = flattenLessons(course);
  const idx = flat.findIndex((l) => l.slug === lessonSlug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}

export type { Course };
