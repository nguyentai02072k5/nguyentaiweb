'use client';

/**
 * classroom-topbar.tsx — Thanh trên cùng khu học (chrome-free, RT2-1).
 *
 * Không phải header marketing (đó là course-header.tsx cho landing). Ở đây:
 * nút ☰ mở drawer (mobile), tên khoá, email + Đăng xuất (Server Action P2).
 * Nút ☰ có aria-label (RT2-5). signOut import từ actions — Server Action dùng
 * trong Client Component hợp lệ.
 */

import Link from 'next/link';
import { signOut } from '@/app/course/actions';

interface ClassroomTopbarProps {
  courseTitle: string;
  userEmail: string | null;
  onOpenMenu: () => void;
}

export function ClassroomTopbar({ courseTitle, userEmail, onOpenMenu }: ClassroomTopbarProps) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(6,12,10,.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '11px 16px',
          maxWidth: 1240,
          margin: '0 auto',
        }}
      >
        {/* Hamburger — chỉ mobile/tablet (< lg) */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Mở danh sách bài học"
          className="lg:hidden c-btn c-btn-ghost"
          style={{ padding: '8px 11px', fontSize: 16 }}
        >
          <span aria-hidden="true">☰</span>
        </button>

        {/* Logo mini + tên khoá */}
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'inherit', minWidth: 0 }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: 'var(--grad)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: '#04120e',
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            T
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 'var(--fs-card-title)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {courseTitle}
          </span>
        </Link>

        <span style={{ flex: 1 }} />

        {userEmail && (
          <span
            className="hidden sm:block"
            title={userEmail}
            style={{
              fontSize: 'var(--fs-xs)',
              color: 'var(--muted)',
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userEmail}
          </span>
        )}

        <form action={signOut}>
          <button
            type="submit"
            className="c-btn c-btn-outline"
            style={{ fontSize: 'var(--fs-xs)', padding: '7px 13px' }}
          >
            Đăng xuất
          </button>
        </form>
      </div>
    </header>
  );
}
