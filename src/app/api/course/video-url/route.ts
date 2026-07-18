/**
 * /api/course/video-url — Mint lại signed URL video (REFRESH, không phải load đầu).
 *
 * Load đầu tiên: page.tsx mint SERVER-SIDE và truyền initialVideoUrl cho player
 * (bỏ waterfall — RT2-13). Route này CHỈ dùng khi player cần refresh URL trước/
 * sau khi hết hạn (timer hoặc onError 403).
 *
 * TRUST BOUNDARY (RT-6): route này KHÔNG thừa hưởng gate learn/layout.tsx và
 * proxy course.* BỎ QUA /api → PHẢI tự bảo vệ: requireCourseUser() + rate-limit
 * + verify lesson tồn tại. force-dynamic + no-cache (URL ký theo user/thời điểm).
 */

import { NextResponse } from 'next/server';
import { requireCourseUser } from '@/lib/course/require-course-user';
import { checkRateLimit } from '@/lib/course/rate-limit';
import { getLessonBySlug } from '@/lib/content/course-lesson-queries';
import { getSignedVideoUrl, VIDEO_URL_TTL_SECONDS } from '@/lib/r2/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 1. Authz THẬT (getUser revalidate) — 401 nếu chưa đăng nhập.
  const user = await requireCourseUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 2. Rate-limit best-effort per-instance (RT2-8) — chặn spam thô trên 1 instance.
  if (!checkRateLimit(`video-url:${user.id}`)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  // 3. Parse body.
  let payload: { courseSlug?: unknown; lessonSlug?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const courseSlug = typeof payload.courseSlug === 'string' ? payload.courseSlug : '';
  const lessonSlug = typeof payload.lessonSlug === 'string' ? payload.lessonSlug : '';
  if (!courseSlug || !lessonSlug) {
    return NextResponse.json({ error: 'missing_params' }, { status: 400 });
  }

  // 4. Verify lesson tồn tại (chống mint tuỳ ý object key). Không tồn tại → 400.
  const found = getLessonBySlug(courseSlug, lessonSlug);
  if (!found) {
    return NextResponse.json({ error: 'lesson_not_found' }, { status: 400 });
  }

  // 5. Mint.
  try {
    const url = await getSignedVideoUrl(found.lesson.videoKey);
    return NextResponse.json(
      { url, ttl: VIDEO_URL_TTL_SECONDS },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[video-url] mint failed:', err);
    return NextResponse.json({ error: 'mint_failed' }, { status: 500 });
  }
}
