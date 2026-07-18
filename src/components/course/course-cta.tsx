/**
 * course-cta.tsx — Final CTA block "Bắt đầu thôi".
 * Khối gradient có viền phát sáng + nút shimmer nhẹ.
 * CTA trỏ /course/dang-nhap (stub P1, wiring auth P2).
 */

import Link from 'next/link';

export function CourseCta() {
  return (
    <div className="c-reveal" style={{ margin: '48px 0' }}>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(130deg, #0c211c, #0a1512)',
          border: '1px solid var(--border-strong)',
          borderRadius: 24,
          padding: 44,
          textAlign: 'center',
          boxShadow: '0 40px 90px -50px rgba(51,225,203,.5)',
        }}
      >
        {/* Glow trang trí sau tiêu đề */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(60% 90% at 50% -10%, rgba(51,225,203,.16), transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="c-eyebrow">Bắt đầu thôi</span>

          <h2
            className="c-h2"
            style={{ fontSize: 'clamp(24px, 3.4vw, 36px)', marginTop: 8 }}
          >
            Đăng nhập một lần — học trọn thư viện miễn phí
          </h2>

          <p style={{ color: 'var(--muted)', marginTop: 12, fontSize: 'var(--fs-body)' }}>
            Chỉ cần email. Vào thẳng thư viện, chọn khoá bạn cần và học ngay.
          </p>

          <Link
            href="/dang-nhap"
            className="c-btn c-btn-primary c-shimmer"
            style={{ marginTop: 24, fontSize: 15, padding: '14px 26px' }}
          >
            Đăng nhập để vào học <span className="c-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
