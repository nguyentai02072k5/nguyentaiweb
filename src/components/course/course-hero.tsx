/**
 * course-hero.tsx — Hero section landing /course.
 * Bố cục bất đối xứng có chiều sâu: cột chữ + khung preview video phát sáng.
 * Value prop + chip số liệu + CTA + preview video (khoá gated).
 * Dùng type-scale token + utility class scope; tránh fontSize inline rời rạc.
 */

import Link from 'next/link';

const CHIPS = [
  { value: '6', label: 'khoá học' },
  { value: '50+', label: 'bài video' },
  { value: '20+', label: 'giờ học' },
  { value: 'Miễn phí', label: 'trọn đời' },
];

export function CourseHero() {
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '1.15fr .85fr',
        gap: 40,
        alignItems: 'center',
        padding: '56px 0 44px',
      }}
      className="course-hero"
    >
      {/* Left: text */}
      <div>
        <span className="c-eyebrow">Thư viện học miễn phí · Đăng nhập là học</span>

        <h1 className="c-h1" style={{ marginTop: 14 }}>
          Ứng dụng{' '}
          <span style={{ color: 'var(--primary)' }}>AI &amp; Tự động hoá</span>: Bắt đầu
          từ những việc thực tế nhất.
        </h1>

        <p
          style={{
            marginTop: 18,
            fontSize: 'var(--fs-lead)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--ink-soft)',
            maxWidth: '52ch',
          }}
        >
          Thư viện này lưu giữ những đúc kết của mình trong quá trình làm việc thực tế.
          Không cần bạn phải rành công nghệ hay biết viết code. Tụi mình sẽ cùng nhau đi
          từ số 0 đến khi bạn tự tay dựng được web, làm được chatbot và tối ưu luồng công
          việc hằng ngày. Cứ chậm rãi, làm đúng thứ mình cần.
        </p>

        {/* Chips số liệu */}
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 22 }}>
          {CHIPS.map((chip) => (
            <span
              key={chip.label}
              style={{
                fontSize: 'var(--fs-xs)',
                fontWeight: 600,
                padding: '7px 13px',
                borderRadius: 999,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--ink-soft)',
              }}
            >
              <b style={{ color: 'var(--primary)' }}>{chip.value}</b> {chip.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 26, alignItems: 'center' }}>
          <Link
            href="/dang-nhap"
            className="c-btn c-btn-primary"
            style={{ fontSize: 15, padding: '14px 24px' }}
          >
            Đăng nhập để vào học <span className="c-arrow" aria-hidden="true">→</span>
          </Link>
          <a
            href="#courses"
            className="c-btn c-btn-ghost"
            style={{ fontSize: 14, padding: '11px 20px' }}
          >
            Xem các khoá học
          </a>
        </div>

        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--muted)', marginTop: 14 }}>
          Miễn phí 100% · Đăng nhập bằng email (magic-link), không mật khẩu. Hợp với người mới, chủ shop, freelancer.
        </p>
      </div>

      {/* Right: preview video — khung phát sáng, có chiều sâu */}
      <div
        className="course-hero-preview"
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid var(--border-strong)',
          background: '#000',
          boxShadow: '0 30px 70px -32px rgba(0,0,0,.9), 0 0 60px -30px rgba(51,225,203,.5)',
        }}
      >
        <div
          style={{
            position: 'relative',
            aspectRatio: '16/10',
            background: 'radial-gradient(120% 120% at 30% 20%, #12332c, #060d0b 62%)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {/* Play button */}
          <div
            aria-hidden="true"
            className="course-hero-play"
            style={{
              width: 74,
              height: 74,
              borderRadius: '50%',
              background: 'rgba(51,225,203,.92)',
              display: 'grid',
              placeItems: 'center',
              color: '#04120e',
              fontSize: 26,
              boxShadow: '0 12px 34px -14px rgba(0,0,0,.8)',
            }}
          >
            ▶
          </div>
          {/* Lock badge */}
          <span
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              fontSize: 11.5,
              fontWeight: 600,
              color: 'var(--ink-soft)',
              background: 'rgba(0,0,0,.5)',
              border: '1px solid var(--border)',
              padding: '5px 11px',
              borderRadius: 999,
              backdropFilter: 'blur(4px)',
            }}
          >
            🔒 Đăng nhập để mở toàn bộ thư viện
          </span>
        </div>
        <div
          style={{
            padding: '13px 15px',
            background: 'var(--surface)',
            fontSize: 'var(--fs-xs)',
            color: 'var(--muted)',
          }}
        >
          Bài nổi bật · Cơ hội thật sự của chuyên gia trong thời đại AI
        </div>
      </div>

      {/* Responsive: mobile stack + play button pulse (guard reduced-motion trong theme) */}
      <style>{`
        @media (max-width: 900px) {
          .course-hero {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
            padding: 36px 0 !important;
          }
        }
        @keyframes course-play-pulse {
          0%, 100% { box-shadow: 0 12px 34px -14px rgba(0,0,0,.8), 0 0 0 0 rgba(51,225,203,.45); }
          50% { box-shadow: 0 12px 34px -14px rgba(0,0,0,.8), 0 0 0 14px rgba(51,225,203,0); }
        }
        .course-hero-play { animation: course-play-pulse 2.6s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .course-hero-play { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
