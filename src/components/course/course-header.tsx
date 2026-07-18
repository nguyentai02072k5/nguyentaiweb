/**
 * course-header.tsx — Header sticky cho landing /course.
 * Logo + nav + nút auth-aware.
 *
 * Auth-aware (P2):
 *   - Đã đăng nhập: hiện email rút gọn + nút Đăng xuất (form → Server Action signOut).
 *   - Chưa đăng nhập: giữ nút Đăng nhập / Học miễn phí.
 *
 * RSC page.tsx gọi getCurrentUser() và truyền prop `user` xuống đây.
 * Không gọi getCurrentUser() trực tiếp trong component này (tránh waterfall).
 *
 * Dùng utility class scope (c-btn…) + token, HTML nhẹ, hover có phản hồi.
 */

import Link from 'next/link';
import { signOut } from '@/app/course/actions';
import type { User } from '@supabase/supabase-js';

const NAV_LINKS = [
  { href: '#value', label: 'Vì sao học' },
  { href: '#courses', label: 'Khoá học' },
  { href: '#share', label: 'Chia sẻ' },
  { href: '#faq', label: 'Hỏi đáp' },
];

/** Rút gọn email: "nguyen.van.tai@gmail.com" → "nguyen…@gmail.com" */
function shortenEmail(email: string): string {
  const atIdx = email.indexOf('@');
  if (atIdx <= 0) return email;
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  if (local.length <= 6) return email;
  return `${local.slice(0, 4)}…${domain}`;
}

interface CourseHeaderProps {
  /** User từ getCurrentUser() ở RSC page.tsx. null = chưa đăng nhập. */
  user?: Pick<User, 'email'> | null;
}

export function CourseHeader({ user }: CourseHeaderProps) {
  const isLoggedIn = !!user;
  const displayEmail = user?.email ? shortenEmail(user.email) : null;

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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
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

        {/* CTA buttons — auth-aware */}
        {isLoggedIn ? (
          /* Đã đăng nhập: email rút gọn + nút Đăng xuất */
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {displayEmail && (
              <span
                className="course-login-btn"
                style={{
                  fontSize: 13,
                  color: 'var(--muted)',
                  maxWidth: 160,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={user?.email}
              >
                {displayEmail}
              </span>
            )}
            {/* Server Action signOut qua form — không cần JS client */}
            <form action={signOut}>
              <button
                type="submit"
                className="c-btn c-btn-outline"
                style={{ fontSize: 13, padding: '8px 16px' }}
              >
                Đăng xuất
              </button>
            </form>
          </div>
        ) : (
          /* Chưa đăng nhập: nút Đăng nhập + Học miễn phí */
          <>
            <Link
              href="/dang-nhap"
              className="c-btn c-btn-outline course-login-btn"
              style={{ fontSize: 14, padding: '9px 18px' }}
            >
              Đăng nhập
            </Link>
            <Link
              href="/dang-nhap"
              className="c-btn c-btn-primary"
              style={{ fontSize: 14, padding: '11px 20px' }}
            >
              Học miễn phí <span className="c-arrow" aria-hidden="true">→</span>
            </Link>
          </>
        )}
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
