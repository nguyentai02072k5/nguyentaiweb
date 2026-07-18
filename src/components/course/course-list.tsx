/**
 * course-list.tsx — Danh sách khoá accordion (details/summary native).
 *
 * Mỗi khoá = 1 <details> accordion: summary hiện tên/level/số bài/thời lượng,
 * nội dung hiện vài bài teaser + badge "Xem thử" cho free + 🔒 phần còn lại
 * + "và N bài nữa". Không cần JS client — native <details> hoạt động SSG/SSR.
 *
 * Mỗi khoá có mã màu riêng (accent badge cycle teal/mint/lime) làm visual.
 * Dữ liệu từ Velite (CourseSummary[]) — không hằng số cứng.
 */

import type { CourseSummary } from '@/lib/content/course-queries';

const LEVEL_LABEL: Record<string, string> = {
  'co-ban': 'Cơ bản',
  'nang-cao': 'Nâng cao',
};

// Mã màu theo khoá — cycle để mỗi khoá có nhận diện thị giác riêng.
const ACCENTS = ['var(--primary)', 'var(--mint)', 'var(--lime)'];

// Số bài teaser hiển thị mỗi khoá trước khi cắt "và N bài nữa"
const TEASER_COUNT = 3;

interface CourseListProps {
  courses: CourseSummary[];
}

export function CourseList({ courses }: CourseListProps) {
  return (
    <section className="c-section c-section--divider" id="courses">
      <div className="c-section-head c-reveal">
        <span className="c-eyebrow">Thư viện khoá học</span>
        <h2 className="c-h2">Các khoá học miễn phí</h2>
        <p className="c-section-desc">
          Chọn khoá theo nhu cầu — học cái nào trước cũng được. Mở một khoá để xem trước
          nội dung; đăng nhập để mở toàn bộ video.
        </p>
      </div>

      <div className="c-reveal" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {courses.map((course, idx) => (
          <CourseAccordion
            key={course.slug}
            course={course}
            defaultOpen={idx === 0}
            accent={ACCENTS[idx % ACCENTS.length]}
          />
        ))}
      </div>
    </section>
  );
}

function CourseAccordion({
  course,
  defaultOpen,
  accent,
}: {
  course: CourseSummary;
  defaultOpen: boolean;
  accent: string;
}) {
  // Flatten tất cả lessons từ mọi module để hiển thị teaser
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const teaserLessons = allLessons.slice(0, TEASER_COUNT);
  const remainingCount = allLessons.length - teaserLessons.length;
  const orderStr = String(course.order).padStart(2, '0');

  return (
    <details
      open={defaultOpen}
      id={`course-${course.slug}`}
      className="course-accordion"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        // Dải màu accent mảnh bên trái làm mã màu khoá
        borderLeft: `3px solid ${accent}`,
        transition: 'border-color .18s ease',
      }}
    >
      <summary
        style={{
          listStyle: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 13,
          padding: '16px 18px',
        }}
      >
        {/* Order badge — mã màu theo khoá */}
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: 'var(--surface-3)',
            color: accent,
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {orderStr}
        </span>

        {/* Title + meta */}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 'var(--fs-card-title)', display: 'block' }}>
            {course.title}
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3, display: 'block' }}>
            {LEVEL_LABEL[course.level] ?? course.level}
            {' · '}
            {course.lessonCount} bài
            {course.durationLabel ? ` · ${course.durationLabel}` : ''}
          </span>
        </span>

        {/* Chevron */}
        <span
          aria-hidden="true"
          className="course-chevron"
          style={{ color: 'var(--muted)', fontSize: 13, flexShrink: 0, transition: 'transform .2s ease' }}
        >
          ▶
        </span>
      </summary>

      {/* Lessons teaser */}
      <div style={{ padding: '4px 18px 14px' }}>
        {teaserLessons.map((lesson, i) => (
          <div
            key={lesson.slug}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '10px 0',
              borderTop: i === 0 ? 'none' : '1px solid var(--border)',
              fontSize: 14,
              color: 'var(--ink-soft)',
            }}
          >
            <span aria-hidden="true" style={{ color: accent, fontSize: 12 }}>▶</span>
            <span style={{ flex: 1 }}>{lesson.title}</span>
            {lesson.free ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--mint)',
                  background: 'rgba(52,211,153,.10)',
                  border: '1px solid rgba(52,211,153,.25)',
                  padding: '3px 9px',
                  borderRadius: 999,
                }}
              >
                Xem thử
              </span>
            ) : (
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>🔒</span>
            )}
            {lesson.duration && (
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>{lesson.duration}</span>
            )}
          </div>
        ))}

        {/* "và N bài nữa" */}
        {remainingCount > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '10px 0',
              borderTop: '1px solid var(--border)',
              fontSize: 14,
              color: 'var(--muted)',
            }}
          >
            <span aria-hidden="true" style={{ color: 'var(--muted)', fontSize: 12 }}>＋</span>
            <span>và {remainingCount} bài nữa</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--primary)' }}>
              Đăng nhập để mở
            </span>
          </div>
        )}
      </div>
    </details>
  );
}
