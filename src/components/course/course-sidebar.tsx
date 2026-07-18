/**
 * course-sidebar.tsx — Danh sách chương/bài khu học.
 *
 * Presentational: <details> accordion mỗi module, bài là Link (path sạch
 * `/learn/...`). Bài hiện tại highlight + `aria-current="page"` (RT2-5, dựng NGAY
 * ở P3 — không đẩy P5 để tránh retrofit aria sau memo). Chỗ checkmark + progress
 * bar để 0% (P4 nối data lesson_progress).
 *
 * Dùng ở cả cột desktop (aside sticky) lẫn drawer mobile (Sheet) — không state,
 * điều hướng link đóng drawer tự nhiên (page mới remount shell).
 */

import Link from 'next/link';
import type { Course } from '@/lib/content/course-lesson-queries';

interface CourseSidebarProps {
  course: Pick<Course, 'title' | 'slug' | 'modules' | 'lessonCount'>;
  currentLessonSlug: string;
  /** % hoàn thành — P4 truyền thật; P3 mặc định 0. */
  progressPercent?: number;
  /** Gọi khi bấm 1 link (dùng để đóng drawer mobile). */
  onNavigate?: () => void;
}

export function CourseSidebar({
  course,
  currentLessonSlug,
  progressPercent = 0,
  onNavigate,
}: CourseSidebarProps) {
  // Offset số bài đầu mỗi module → đánh số bài liên tục mà không reassign khi render.
  const moduleOffsets: number[] = [];
  let acc = 0;
  for (const mod of course.modules) {
    moduleOffsets.push(acc);
    acc += mod.lessons.length;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header + progress bar */}
      <div>
        <Link
          href="/"
          onClick={onNavigate}
          style={{
            fontSize: 'var(--fs-eyebrow)',
            letterSpacing: 'var(--tracking-eyebrow)',
            textTransform: 'uppercase',
            color: 'var(--primary)',
            fontWeight: 700,
          }}
        >
          ← Thư viện khoá
        </Link>
        <h2
          style={{
            fontSize: 'var(--fs-h3)',
            fontWeight: 800,
            margin: '8px 0 10px',
            lineHeight: 1.2,
          }}
        >
          {course.title}
        </h2>
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tiến độ khoá học"
          style={{
            height: 6,
            borderRadius: 999,
            background: 'var(--surface-3)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'var(--grad)',
            }}
          />
        </div>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--muted)', marginTop: 6 }}>
          {progressPercent}% · {course.lessonCount} bài
        </p>
      </div>

      {/* Modules */}
      <nav aria-label="Danh sách bài học" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {course.modules.map((mod, mIdx) => {
          const moduleHasCurrent = mod.lessons.some((l) => l.slug === currentLessonSlug);
          return (
            <details
              key={`${mod.title}-${mIdx}`}
              open={moduleHasCurrent || mIdx === 0}
              className="course-accordion"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <summary
                style={{
                  listStyle: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 13px',
                  fontSize: 'var(--fs-sm)',
                  fontWeight: 700,
                }}
              >
                <span
                  aria-hidden="true"
                  className="course-chevron"
                  style={{ color: 'var(--muted)', fontSize: 11, transition: 'transform .2s ease' }}
                >
                  ▶
                </span>
                <span style={{ flex: 1 }}>{mod.title}</span>
                <span style={{ color: 'var(--muted)', fontSize: 'var(--fs-xs)', fontWeight: 500 }}>
                  {mod.lessons.length} bài
                </span>
              </summary>

              <ul style={{ listStyle: 'none', margin: 0, padding: '0 6px 8px' }}>
                {mod.lessons.map((lesson, lIdx) => {
                  const lessonNumber = moduleOffsets[mIdx] + lIdx + 1;
                  const isCurrent = lesson.slug === currentLessonSlug;
                  return (
                    <li key={lesson.slug}>
                      <Link
                        href={`/learn/${course.slug}/${lesson.slug}`}
                        onClick={onNavigate}
                        // prefetch=false: route gated force-dynamic — tránh prefetch
                        // kích gate getUser() + mint URL hàng loạt khi hover sidebar.
                        prefetch={false}
                        aria-current={isCurrent ? 'page' : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 9,
                          padding: '9px 10px',
                          borderRadius: 9,
                          fontSize: 'var(--fs-sm)',
                          color: isCurrent ? 'var(--primary)' : 'var(--ink-soft)',
                          background: isCurrent ? 'var(--surface-3)' : 'transparent',
                          fontWeight: isCurrent ? 700 : 500,
                          textDecoration: 'none',
                        }}
                      >
                        {/* Chỗ chừa checkmark (P4). P3: chỉ số thứ tự bài. */}
                        <span
                          aria-hidden="true"
                          style={{
                            width: 20,
                            height: 20,
                            flexShrink: 0,
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 11,
                            color: isCurrent ? 'var(--primary)' : 'var(--muted)',
                          }}
                        >
                          {isCurrent ? '▶' : lessonNumber}
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>{lesson.title}</span>
                        {lesson.duration && (
                          <span style={{ color: 'var(--muted)', fontSize: 'var(--fs-xs)', flexShrink: 0 }}>
                            {lesson.duration}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </nav>
    </div>
  );
}
