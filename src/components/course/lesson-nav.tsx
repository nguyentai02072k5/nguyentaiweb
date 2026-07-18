/**
 * lesson-nav.tsx — Điều hướng bài trước / bài sau (vượt ranh giới module).
 * Presentational: nhận prev/next đã tính từ getAdjacentLessons ở page.tsx.
 * Link dùng path SẠCH `/learn/...` (proxy course.* tự thêm /course).
 */

import Link from 'next/link';
import type { FlatLesson } from '@/lib/content/course-lesson-queries';

interface LessonNavProps {
  prev: FlatLesson | null;
  next: FlatLesson | null;
}

export function LessonNav({ prev, next }: LessonNavProps) {
  return (
    <nav
      aria-label="Điều hướng bài học"
      style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'space-between',
        marginTop: 20,
      }}
    >
      {prev ? (
        <Link
          href={prev.href}
          prefetch={false}
          className="c-btn c-btn-ghost"
          aria-label={`Bài trước: ${prev.title}`}
          style={{ flex: 1, minWidth: 0, padding: '11px 16px', justifyContent: 'flex-start' }}
        >
          <span className="c-arrow" aria-hidden="true">←</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {prev.title}
          </span>
        </Link>
      ) : (
        <span style={{ flex: 1 }} />
      )}

      {next ? (
        <Link
          href={next.href}
          prefetch={false}
          className="c-btn c-btn-primary"
          aria-label={`Bài tiếp: ${next.title}`}
          style={{ flex: 1, minWidth: 0, padding: '11px 16px', justifyContent: 'flex-end' }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {next.title}
          </span>
          <span className="c-arrow" aria-hidden="true">→</span>
        </Link>
      ) : (
        <span style={{ flex: 1 }} />
      )}
    </nav>
  );
}
