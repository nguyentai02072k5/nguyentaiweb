/**
 * dang-nhap/page.tsx — Trang đăng nhập magic-link /course/dang-nhap.
 *
 * RSC: đọc searchParams để lấy `next` (deep-link sau login) và `error`
 * (error=link-expired từ callback route khi code đã tiêu thụ/hết hạn).
 * Truyền xuống LoginForm (Client Component) để render form tương tác.
 *
 * Dark-teal theme kế thừa từ course/layout.tsx (scope .course-app).
 */

import type { Metadata } from 'next';
import { LoginForm } from '@/components/course/login-form';

export const metadata: Metadata = {
  title: 'Đăng nhập — Tài Academy',
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function DangNhapPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = params.next ?? null;
  const linkExpired = params.error === 'link-expired';

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: '40px 22px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '36px 32px',
        }}
      >
        {/* Logo mini */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <span
            aria-hidden="true"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--grad)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: '#04120e',
              fontSize: 17,
              flexShrink: 0,
            }}
          >
            T
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            Tài Academy
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: '-0.02em',
            marginBottom: 8,
          }}
        >
          Đăng nhập để vào học
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 0, lineHeight: 1.55, marginBottom: 24 }}>
          Nhập email — hệ thống gửi link magic-link. Bấm vào link là vào học ngay,
          không cần mật khẩu.
        </p>

        <LoginForm next={next} linkExpired={linkExpired} />
      </div>
    </main>
  );
}
