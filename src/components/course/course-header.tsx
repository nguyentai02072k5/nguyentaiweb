/**
 * course-header.tsx — Header sticky cho landing /course.
 * Logo + nav + nút Đăng nhập / Học miễn phí.
 * Tất cả CTA login trỏ /course/dang-nhap (stub P1, wiring auth P2).
 * Dùng utility class scope (c-btn…) + token, HTML nhẹ, hover có phản hồi.
 */

import Link from 'next/link';

const NAV_LINKS = [
  { href: '#value', label: 'Vì sao học' },
  { href: '#courses', label: 'Khoá học' },
  { href: '#share', label: 'Chia sẻ' },
  { href: '#faq', label: 'Hỏi đáp' },
];

export function CourseHeader() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(6,12,10,.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          maxWidth: 1140,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '13px 22px',
        }}
      >
        {/* Logo */}
        <Link href="/course" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: 'var(--grad)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: '#04120e',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            T
          </span>
          <span>
            <b style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, display: 'block', lineHeight: 1 }}>
              Tài Academy
            </b>
            <small
              style={{
                fontSize: 9,
                letterSpacing: '.28em',
                textTransform: 'uppercase',
                color: 'var(--primary)',
                fontWeight: 700,
                marginTop: 3,
                display: 'block',
              }}
            >
              Nguyễn Văn Tài
            </small>
          </span>
        </Link>

        {/* Nav */}
        <nav
          className="course-nav"
          style={{ display: 'flex', gap: 4, marginLeft: 12 }}
          aria-label="Course navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: 13.5,
                color: 'var(--ink-soft)',
                padding: '8px 12px',
                borderRadius: 9,
                textDecoration: 'none',
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <span style={{ flex: 1 }} />

        {/* CTA buttons */}
        <Link
          href="/course/dang-nhap"
          className="c-btn c-btn-outline course-login-btn"
          style={{ fontSize: 14, padding: '9px 18px' }}
        >
          Đăng nhập
        </Link>
        <Link
          href="/course/dang-nhap"
          className="c-btn c-btn-primary"
          style={{ fontSize: 14, padding: '11px 20px' }}
        >
          Học miễn phí <span className="c-arrow" aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Responsive: ẩn nav + nút phụ trên mobile hẹp để header không vỡ */}
      <style>{`
        @media (max-width: 720px) {
          .course-nav { display: none !important; }
          .course-login-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
}
