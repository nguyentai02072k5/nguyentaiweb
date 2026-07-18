/**
 * course-footer.tsx — Footer khu học tập /course (chrome-free).
 * Thương hiệu + social + link nhanh + pháp lý (điều khoản/bảo mật).
 * Icon social = inline SVG (không tải thêm tài nguyên). Link thật:
 * Facebook/TikTok/Zalo từ main site + YouTube (@tai-ai-automation).
 */

import Link from 'next/link';

// Icon brand tối giản (path currentColor). Link THẬT lấy từ main site
// (src/content/landing.ts — brand "Tài AI Automation"). Main site không có YouTube.
const SOCIALS: { label: string; href: string; path: string }[] = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=61589059652030',
    path: 'M14 9h3l.4-3H14V4.3c0-.9.3-1.4 1.5-1.4H17V.2C16.6.1 15.6 0 14.5 0 12 0 10.4 1.5 10.4 4.2V6H8v3h2.4v9H14V9z',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@vtai027',
    path: 'M15.5 0c.4 2.3 1.8 3.9 4 4.1v2.8c-1.3.1-2.5-.3-3.7-1v6.6c0 3.4-2.7 6.1-6.1 6.1S3.6 15.9 3.6 12.5 6.3 6.4 9.7 6.4c.3 0 .6 0 .9.1v2.9c-.3-.1-.6-.2-.9-.2-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9V0h2.9z',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@tai-ai-automation?sub_confirmation=1',
    path: 'M21.6 6.2c-.2-.9-.9-1.6-1.8-1.8C18.2 4 12 4 12 4s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 7.8 2 12 2 12s0 4.2.4 5.8c.2.9.9 1.6 1.8 1.8C5.8 20 12 20 12 20s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-5.8.4-5.8s0-4.2-.4-5.8zM10 15V9l5.2 3L10 15z',
  },
  {
    label: 'Zalo',
    href: 'https://zalo.me/0345324467',
    path: 'M12 2C6.5 2 2 5.9 2 10.6c0 2.6 1.4 5 3.6 6.6-.1 1-.5 2.2-1.3 3.3-.2.3 0 .7.4.6 1.8-.4 3.2-1.1 4.1-1.7 1 .2 2.1.3 3.2.3 5.5 0 10-3.9 10-8.6S17.5 2 12 2z',
  },
];

const EXPLORE = [
  { label: 'Vì sao học', href: '/#value' },
  { label: 'Khoá học', href: '/#courses' },
  { label: 'Hỏi đáp', href: '/#faq' },
];

const LEGAL = [
  { label: 'Điều khoản sử dụng', href: '/dieu-khoan' },
  { label: 'Chính sách bảo mật', href: '/bao-mat' },
];

export function CourseFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: 20 }}>
      <div
        className="course-footer-grid"
        style={{
          maxWidth: 1140,
          margin: '0 auto',
          padding: '40px 22px 20px',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr',
          gap: 28,
        }}
      >
        {/* Thương hiệu + social */}
        <div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span
              aria-hidden="true"
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
              }}
            >
              T
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>
              Tài Academy
            </span>
          </Link>
          <p style={{ marginTop: 12, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, maxWidth: '34ch' }}>
            Thư viện học AI, web & tự động hoá — miễn phí, thực chiến, cập nhật liên tục.
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                title={s.label}
                target="_blank"
                rel="noopener noreferrer"
                className="course-social"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--muted)',
                  transition: 'color .18s ease, border-color .18s ease',
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Khám phá */}
        <nav aria-label="Khám phá">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
            Khám phá
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} style={{ color: 'var(--muted)', fontSize: 13.5 }} className="course-foot-link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Pháp lý */}
        <nav aria-label="Pháp lý">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
            Pháp lý
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} style={{ color: 'var(--muted)', fontSize: 13.5 }} className="course-foot-link">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid var(--border)' }}>
        <div
          style={{
            maxWidth: 1140,
            margin: '0 auto',
            padding: '16px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            color: 'var(--muted)',
            fontSize: 12.5,
          }}
        >
          <span>© 2026 Tài Academy · course.nguyenvantai.com</span>
          <span>Được xây bởi Nguyễn Văn Tài</span>
        </div>
      </div>

      <style>{`
        .course-social:hover { color: var(--primary); border-color: var(--border-strong); }
        .course-foot-link:hover { color: var(--primary); }
        @media (max-width: 640px) {
          .course-footer-grid { grid-template-columns: 1fr 1fr !important; }
          .course-footer-grid > div:first-child { grid-column: 1 / -1; }
        }
      `}</style>
    </footer>
  );
}
