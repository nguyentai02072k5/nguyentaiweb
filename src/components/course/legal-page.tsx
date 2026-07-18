/**
 * legal-page.tsx — Shell dùng chung cho trang văn bản pháp lý (điều khoản, bảo mật).
 * Kế thừa theme dark-teal từ course/layout.tsx. Prose dài dùng class .c-prose.
 */

import Link from 'next/link';

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '32px 22px 64px' }}>
      <Link href="/course" style={{ color: 'var(--primary)', fontSize: 13.5, fontWeight: 600 }}>
        ← Về trang chủ
      </Link>

      <h1 className="c-h1" style={{ marginTop: 16, fontSize: 'clamp(26px, 4vw, 38px)' }}>
        {title}
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>Cập nhật lần cuối: {updated}</p>

      <div className="c-prose" style={{ marginTop: 24 }}>
        {children}
      </div>
    </main>
  );
}
