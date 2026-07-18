/**
 * learn/layout.tsx — GATE khu học (RT-5).
 *
 * BẮT BUỘC force-dynamic + KHÔNG generateStaticParams: nếu để SSG, gate chạy
 * lúc build (cookie null) → vô hiệu hoặc build lỗi. force-dynamic ép chạy mỗi
 * request → đọc được cookie session thật.
 *
 * Chưa login → redirect `/dang-nhap?next=<pathname>`. pathname lấy từ header
 * `x-pathname` do proxy course.* inject (RT-3) — RSC KHÔNG tự đọc được URL path.
 * next giữ nguyên dạng `/course/...` để khớp safeNextPath() (P2).
 *
 * Đây CHỈ gate render trang. Trust boundary video là /api/course/video-url
 * (tự requireCourseUser) — RT-6.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase/get-user';

export const dynamic = 'force-dynamic';

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    const pathname = (await headers()).get('x-pathname') ?? '/course';
    redirect(`/dang-nhap?next=${encodeURIComponent(pathname)}`);
  }

  return <>{children}</>;
}
