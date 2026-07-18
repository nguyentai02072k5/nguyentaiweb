/**
 * page.tsx — Landing thư viện khoá học công khai /course.
 *
 * RSC: gọi getCourses() (Velite, build-time), render các section theo mock.
 * Dynamic ở request-time vì đọc cookie auth (header đổi trạng thái đăng nhập);
 * getCurrentUser() có anon fast-path nên khách công khai KHÔNG tốn round-trip.
 * Nội dung khoá vẫn từ Velite build-time (git). Metadata + JSON-LD riêng cho /course.
 */

import type { Metadata } from 'next';
import { getCourses } from '@/lib/content/course-queries';
import {
  buildCourseCollectionJsonLd,
  buildCourseBreadcrumb,
} from '@/lib/seo/course-json-ld';
import { JsonLdScript } from '@/components/seo/json-ld-script';
import { CourseHeader } from '@/components/course/course-header';
import { getCurrentUser } from '@/lib/supabase/get-user';
import { CourseHero } from '@/components/course/course-hero';
import { ValueGrid } from '@/components/course/value-grid';
import { CourseList } from '@/components/course/course-list';
import { Testimonials } from '@/components/course/testimonials';
import { InstructorCard } from '@/components/course/instructor-card';
import { CourseFaq } from '@/components/course/course-faq';
import { CourseCta } from '@/components/course/course-cta';
import { CourseFooter } from '@/components/course/course-footer';

const COURSE_URL = 'https://course.nguyenvantai.com';
const TITLE = 'Tài Academy — Học AI, Web & Tự động hoá miễn phí';
const DESCRIPTION =
  'Bộ khoá thực chiến miễn phí: xây chatbot AI bán hàng, làm website, host free, dùng ChatGPT & Claude, tự động hoá với n8n, dựng landing chuyển đổi cao. Đăng nhập bằng email là học ngay.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: COURSE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Tài Academy',
    locale: 'vi_VN',
    url: COURSE_URL,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function CourseLandingPage() {
  const courses = getCourses();
  // getCurrentUser() revalidates JWT via getUser() — không dùng getSession() (RT-1).
  // Fail-safe: null nếu chưa login hoặc lỗi mạng.
  const user = await getCurrentUser();

  return (
    <>
      {/* Structured data */}
      <JsonLdScript data={[
        buildCourseCollectionJsonLd(courses),
        buildCourseBreadcrumb(),
      ]} />

      <CourseHeader user={user} />

      {/* Main content container */}
      <main>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 22px' }}>
          <CourseHero />
          <ValueGrid />
          <CourseList courses={courses} />
          <Testimonials />
          <InstructorCard />
          <CourseFaq />
        </div>

        {/* Full-width CTA */}
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 22px' }}>
          <CourseCta />
        </div>
      </main>

      <CourseFooter />
    </>
  );
}
