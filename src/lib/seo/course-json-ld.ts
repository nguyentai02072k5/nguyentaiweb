/**
 * course-json-ld.ts — Structured data builders cho khu học tập /course.
 *
 * buildCourseCollectionJsonLd: CollectionPage + ItemList<Course> cho landing /course.
 * Reuse buildBreadcrumb từ json-ld.ts (không duplicate logic).
 */

import type { CourseSummary } from '@/lib/content/course-queries';
import { buildBreadcrumb } from './json-ld';
import { SITE_NAME, absoluteUrl } from './site';

type JsonLd = Record<string, unknown>;

const COURSE_URL = 'https://course.nguyenvantai.com';
const PROVIDER_ORGANIZATION: JsonLd = {
  '@type': 'Organization',
  name: SITE_NAME,
  url: absoluteUrl('/'),
};

/**
 * CollectionPage chứa ItemList các Course (schema.org/Course).
 * Dùng cho trang landing /course — cung cấp rich result cho Google.
 */
export function buildCourseCollectionJsonLd(courses: CourseSummary[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tài Academy — Thư viện khoá học miễn phí',
    description:
      'Bộ khoá thực chiến miễn phí: AI, Web, Tự động hoá. Đăng nhập bằng email là học ngay.',
    url: COURSE_URL,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: courses.length,
      itemListElement: courses.map((course, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Course',
          name: course.title,
          description: course.description,
          url: `${COURSE_URL}#course-${course.slug}`,
          provider: PROVIDER_ORGANIZATION,
          courseMode: 'online',
          isAccessibleForFree: true,
          inLanguage: 'vi',
        },
      })),
    },
  };
}

/**
 * Breadcrumb cho /course — reuse buildBreadcrumb.
 */
export function buildCourseBreadcrumb(): JsonLd {
  return buildBreadcrumb([
    { name: 'Trang chủ', path: '/' },
    { name: 'Khoá học', path: '/course' },
  ]);
}

export { buildBreadcrumb };
