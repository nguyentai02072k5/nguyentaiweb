/**
 * blog-mdx-callouts.tsx - Khối "khung text" cho MDX blog: callout, admin note, pull quote,
 * tóm tắt (TL;DR / roadmap) và CTA. Tất cả dùng Aurora token + `not-prose` để tự kiểm soát
 * style (tránh prose typography đè), an toàn cả light/dark mode.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { LeadText } from './blog-mdx-shared';

type CalloutTone = 'violet' | 'cyan' | 'amber';

const CALLOUT_TITLE: Record<CalloutTone, string> = {
  violet: 'text-brand-violet',
  cyan: 'text-brand-cyan',
  amber: 'text-amber-600 dark:text-amber-400',
};

/** Callout giải nghĩa / lưu ý (icon + tiêu đề nhỏ + nội dung). */
export function Callout({
  icon = '💡',
  title,
  tone = 'violet',
  children,
}: {
  icon?: string;
  title?: string;
  tone?: CalloutTone;
  children: ReactNode;
}) {
  return (
    <div
      className="not-prose my-7 flex gap-4 rounded-lg border border-border-default bg-surface-subtle p-5 sm:p-6"
      data-reveal
    >
      <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-surface-elevated text-xl shadow-card">
        <span aria-hidden>{icon}</span>
      </div>
      <div className="min-w-0">
        {title && (
          <div
            className={`mb-2 font-display text-xs font-semibold uppercase tracking-[0.08em] ${CALLOUT_TITLE[tone]}`}
          >
            {title}
          </div>
        )}
        <div className="space-y-3 text-[0.98rem] leading-relaxed text-text-secondary [&_a]:font-medium [&_a]:text-brand-violet [&_a]:underline [&_strong]:font-semibold [&_strong]:text-text-primary">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Ghi chú giọng "người thật" dạng bong bóng chat. */
export function AdminNote({
  name = 'Admin',
  label = 'góc nhìn thật',
  children,
}: {
  name?: string;
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="not-prose my-7 flex items-start gap-3.5" data-reveal>
      <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-aurora font-display text-xs font-bold text-white shadow-[0_6px_16px_rgba(168,85,247,0.3)]">
        AD
      </div>
      <div className="relative flex-1 rounded-[6px_18px_18px_18px] border border-border-default bg-surface-subtle px-5 py-4 shadow-card">
        <div className="mb-1.5 flex flex-wrap items-center gap-2 font-display text-sm font-semibold text-text-primary">
          {name}
          <span className="rounded-full bg-brand-violet/10 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-brand-violet">
            {label}
          </span>
        </div>
        <div className="space-y-2.5 text-[0.97rem] leading-relaxed text-text-secondary [&_strong]:font-semibold [&_strong]:text-text-primary">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Pull quote nhấn mạnh (in `<span className="text-aurora">` để tô gradient phần cần nổi). */
export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote
      className="not-prose my-10 border-l-4 border-brand-violet pl-7 font-display text-2xl font-medium leading-snug tracking-tight text-text-primary sm:text-[1.7rem]"
      data-reveal
    >
      {children}
    </blockquote>
  );
}

/** Hộp tóm tắt nhanh (TL;DR) hoặc lộ trình đọc (ordered). Tốt cho AEO: trích lời giải ngắn gọn. */
export function KeyTakeaways({
  icon = '⚡',
  title = 'Tóm tắt nhanh',
  intro,
  ordered = false,
  items,
}: {
  icon?: string;
  title?: string;
  intro?: string;
  ordered?: boolean;
  items: string[];
}) {
  return (
    <div
      className="not-prose my-9 rounded-xl border border-border-default border-l-4 border-l-brand-violet bg-surface-elevated p-6 shadow-card sm:p-7"
      data-reveal
    >
      <div className="flex items-center gap-2 font-display text-base font-bold text-text-primary">
        <span aria-hidden>{icon}</span> {title}
      </div>
      {intro && (
        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{intro}</p>
      )}
      <ol className="mt-4 grid list-none gap-3 p-0">
        {items.map((it, i) => (
          <li
            key={i}
            className="relative pl-9 text-[0.97rem] leading-relaxed text-text-secondary"
          >
            {ordered ? (
              <span className="absolute left-0 top-0 grid h-7 w-7 place-items-center rounded-lg bg-aurora font-display text-sm font-bold text-white">
                {i + 1}
              </span>
            ) : (
              <span
                className="absolute left-0 top-1.5 h-4 w-4 rounded-[5px] bg-aurora"
                aria-hidden
              />
            )}
            <LeadText text={it} />
          </li>
        ))}
      </ol>
    </div>
  );
}

/** CTA mềm cuối bài (nền tối luôn cố định để pop ở cả 2 theme). */
export function CTACard({
  eyebrow,
  title,
  href = '/booking',
  cta = 'Đặt lịch demo miễn phí 20 phút',
  note,
  children,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  cta?: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="not-prose relative my-12 overflow-hidden rounded-xl border border-white/10 bg-[#0f0e1a] px-7 py-12 text-center shadow-lg sm:px-10"
      data-reveal
    >
      <div className="pointer-events-none absolute inset-0 bg-mesh-aurora opacity-80" aria-hidden />
      <div className="relative">
        {eyebrow && (
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-violet/30 bg-brand-violet/10 px-3.5 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.14em] text-brand-violet-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" aria-hidden /> {eyebrow}
          </span>
        )}
        <div className="font-display text-2xl font-bold text-white sm:text-[2rem]">
          {title}
        </div>
        <div className="mx-auto mt-4 max-w-xl text-[1.05rem] leading-relaxed text-white/75 [&_strong]:text-white">
          {children}
        </div>
        <Link
          href={href}
          className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-aurora px-8 py-4 font-display text-base font-semibold text-white shadow-[0_12px_32px_rgba(168,85,247,0.4)] transition-transform hover:-translate-y-0.5"
        >
          {cta} <span aria-hidden>→</span>
        </Link>
        {note && <p className="mt-4 text-xs text-white/55">{note}</p>}
      </div>
    </div>
  );
}
