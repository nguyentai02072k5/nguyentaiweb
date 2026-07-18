'use client';

/**
 * login-form.tsx — Magic-link login form cho /course/dang-nhap.
 *
 * Client Component: quản lý state UI (email, loading, sent, error).
 * Logic gửi email gọi Server Action `sendMagicLink` (server-side throttle,
 * không bypass được từ client).
 *
 * Google OAuth: code path có sẵn nhưng ẨN hoàn toàn (v1 chỉ magic-link).
 * Bật v1.1: bỏ `hidden` khỏi nút Google + uncomment `signInWithOAuth`.
 */

import { useState, useTransition } from 'react';
import { sendMagicLink } from '@/app/course/actions';

interface LoginFormProps {
  /** Tham số `next` từ URL (đã decode, chưa validate — validate trong action). */
  next?: string | null;
  /** Hiện thông báo "link hết hạn" khi callback trả error=link-expired. */
  linkExpired?: boolean;
}

export function LoginForm({ next, linkExpired }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const result = await sendMagicLink(email, next ?? null);
      if (result.ok) {
        setSent(true);
      } else {
        setErrorMsg(result.error);
      }
    });
  }

  // --- Trạng thái: đã gửi link ---
  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 40,
            marginBottom: 16,
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          ✉️
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 20,
            marginBottom: 10,
          }}
        >
          Kiểm tra email của bạn
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
          Link đăng nhập đã được gửi tới{' '}
          <strong style={{ color: 'var(--ink)' }}>{email}</strong>.
          <br />
          Bấm vào link trong email là vào học ngay — không cần mật khẩu.
        </p>
        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
          Không thấy email? Kiểm tra thư mục Spam hoặc{' '}
          <button
            type="button"
            onClick={() => setSent(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              padding: 0,
              fontSize: 12,
              textDecoration: 'underline',
            }}
          >
            gửi lại
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Thông báo link hết hạn (RT-14) */}
      {linkExpired && (
        <div
          role="alert"
          style={{
            marginBottom: 20,
            padding: '12px 14px',
            borderRadius: 10,
            background: 'rgba(239,68,68,.12)',
            border: '1px solid rgba(239,68,68,.3)',
            fontSize: 13,
            color: '#fca5a5',
            lineHeight: 1.5,
          }}
        >
          <strong>Link đăng nhập đã hết hạn</strong> hoặc đã được dùng rồi.
          <br />
          Nhập email bên dưới để nhận link mới.
        </div>
      )}

      {/* Server-side error */}
      {errorMsg && (
        <div
          role="alert"
          style={{
            marginBottom: 16,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(239,68,68,.12)',
            border: '1px solid rgba(239,68,68,.3)',
            fontSize: 13,
            color: '#fca5a5',
          }}
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label
            htmlFor="course-email"
            style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}
          >
            Email của bạn
          </label>
          <input
            id="course-email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ten@email.com"
            autoComplete="email"
            required
            disabled={isPending}
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
              opacity: isPending ? 0.7 : 1,
              cursor: isPending ? 'not-allowed' : 'text',
              boxSizing: 'border-box',
            }}
          />

          <button
            type="submit"
            disabled={isPending || !email.trim()}
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
              cursor: isPending || !email.trim() ? 'not-allowed' : 'pointer',
              opacity: isPending || !email.trim() ? 0.65 : 1,
              transition: 'opacity .15s',
            }}
          >
            {isPending ? 'Đang gửi...' : 'Gửi link đăng nhập →'}
          </button>
        </div>
      </form>

      {/* Google OAuth — ẨN v1, bật v1.1: bỏ `hidden` + uncomment logic */}
      <div hidden aria-hidden="true">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: '20px 0',
          }}
        >
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>hoặc</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
        </div>
        <button
          type="button"
          disabled
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 11,
            border: '1px solid var(--border-strong)',
            background: 'var(--surface-2)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {/* v1.1: gọi signInWithOAuth({ provider: 'google', options: { redirectTo: callbackUrl } }) */}
          Đăng nhập với Google
        </button>
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
        Miễn phí 100% · Không spam · Huỷ bất cứ lúc nào
      </p>
    </div>
  );
}
