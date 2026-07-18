/**
 * dang-nhap/page.tsx — Stub tĩnh trang đăng nhập magic-link /course/dang-nhap.
 *
 * P1: UI tĩnh (ô email + nút) để CTA không 404.
 * P2 sẽ wiring Supabase magic-link (signInWithOtp) + redirect sau auth.
 * Dark-teal theme kế thừa từ course/layout.tsx (scope .course-app).
 */

export default function DangNhapPage() {
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
          }}
        >
          Đăng nhập để vào học
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
          Nhập email — hệ thống gửi link magic-link. Bấm vào link là vào học ngay,
          không cần mật khẩu.
        </p>

        {/* Form — P2 sẽ wiring Supabase magic-link (signInWithOtp) */}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label
            htmlFor="email"
            style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}
          >
            Email của bạn
          </label>
          <input
            id="email"
            type="email"
            placeholder="ten@email.com"
            autoComplete="email"
            disabled
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 11,
              border: '1px solid var(--border-strong)',
              background: 'var(--surface-2)',
              color: 'var(--ink)',
              fontSize: 15,
              fontFamily: 'var(--font-body)',
              outline: 'none',
              cursor: 'not-allowed',
              opacity: 0.7,
            }}
          />

          <button
            type="button"
            disabled
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 11,
              border: 'none',
              background: 'var(--primary)',
              color: '#04120e',
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'not-allowed',
              opacity: 0.6,
            }}
          >
            Gửi link đăng nhập →
          </button>
        </div>

        {/* Coming soon notice */}
        <div
          style={{
            marginTop: 20,
            padding: '12px 14px',
            borderRadius: 10,
            background: 'var(--surface-3)',
            border: '1px solid var(--border)',
            fontSize: 13,
            color: 'var(--muted)',
            lineHeight: 1.5,
          }}
        >
          🔧 Tính năng đăng nhập đang được hoàn thiện.{' '}
          <strong style={{ color: 'var(--primary)' }}>Ra mắt sớm!</strong>
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
          Miễn phí 100% · Không spam · Huỷ bất cứ lúc nào
        </p>
      </div>
    </main>
  );
}
