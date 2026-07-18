/**
 * learn/[khoa]/[bai]/page.tsx — Trang bài học (đã gate bởi learn/layout.tsx).
 *
 * force-dynamic + KHÔNG generateStaticParams (RT-5): route gated không được SSG.
 * Mint signed URL SERVER-SIDE ngay đây (RT2-13) → initialVideoUrl có sẵn HTML đầu,
 * player không waterfall. Nội dung MDX render server-side, truyền qua children.
 *
 * noindex: khu học sau đăng nhập không cần SEO (course/layout đặt index:true cho
 * landing; override robots ở đây cho subtree learn).
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getAdjacentLessons,
  getLessonBySlug,
} from '@/lib/content/course-lesson-queries';
import { getCurrentUser } from '@/lib/supabase/get-user';
import { getSignedVideoUrl } from '@/lib/r2/client';
import { MDXContent } from '@/lib/content/mdx-runtime';
import { ClassroomShell } from '@/components/course/classroom-shell';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ khoa: string; bai: string }>;
}) {
  const { khoa, bai } = await params;

  const found = getLessonBySlug(khoa, bai);
  if (!found) notFound();
  const { course, lesson } = found;
  const adjacent = getAdjacentLessons(course, bai);

  // Đã gate bởi layout → user thường non-null; vẫn đọc để hiện email topbar.
  const user = await getCurrentUser();

  // Mint server-side (RT2-13). Lỗi env/R2 → null, player hiện thông báo cấu hình.
  let initialVideoUrl: string | null = null;
  try {
    initialVideoUrl = await getSignedVideoUrl(lesson.videoKey);
  } catch (err) {
    console.error('[lesson] initial mint failed:', err);
  }

  return (
    <ClassroomShell
      course={{
        title: course.title,
        slug: course.slug,
        modules: course.modules,
        lessonCount: course.lessonCount,
      }}
      lesson={lesson}
      adjacent={adjacent}
      initialVideoUrl={initialVideoUrl}
      userEmail={user?.email ?? null}
    >
      <MDXContent code={course.body} />
    </ClassroomShell>
  );
}
