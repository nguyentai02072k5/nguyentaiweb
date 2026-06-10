/**
 * blog-mdx-data.tsx - Khối "dữ liệu / so sánh" cho MDX blog: lưới chỉ số, band số lớn,
 * ngã rẽ 2 hướng, lộ trình bước, checklist. Dùng Aurora token + `not-prose`.
 * Band số dùng nền tối cố định (#15152a) để pop ở cả light/dark mode.
 */

import type { ReactNode } from 'react';
import { LeadText } from './blog-mdx-shared';

/** Lưới 3 chỉ số nổi bật (đầu bài). */
export function StatGrid({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <div className="not-prose my-8 grid gap-3.5 sm:grid-cols-3" data-reveal>
      {items.map((s, i) => (
        <div
          key={i}
          className="rounded-lg border border-border-default bg-surface-subtle p-5"
        >
          <div className="font-display text-2xl font-bold leading-none text-aurora">
            {s.value}
          </div>
          <div className="mt-2 text-[0.82rem] leading-snug text-text-secondary">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Band số lớn (nền tối) + thanh đo tuỳ chọn. Animation (nhảy số/fade/meter) do BlogReveal lo. */
export function DataStat({
  label,
  value,
  unit,
  count,
  countPrefix,
  countSuffix,
  bar,
  barLabel,
  barValue,
  scale,
  children,
}: {
  label?: string;
  value: string;
  unit?: string;
  /** Nếu có → BlogReveal nhảy số 0 → count (vi-VN); `value` là fallback SSR/no-JS/reduced-motion. */
  count?: number;
  countPrefix?: string;
  countSuffix?: string;
  bar?: number;
  barLabel?: string;
  barValue?: string;
  scale?: [string, string, string];
  children?: ReactNode;
}) {
  // Clamp để author lỡ truyền >100/<0 không làm tràn thanh đo.
  const barPct =
    typeof bar === 'number' ? Math.min(100, Math.max(0, bar)) : undefined;
  return (
    <div
      className="not-prose relative my-9 overflow-hidden rounded-xl border border-white/10 bg-[#15152a] p-8 text-white shadow-lg sm:p-11"
      data-reveal
    >
      <div className="pointer-events-none absolute inset-0 bg-mesh-aurora opacity-80" aria-hidden />
      <div className="relative">
        {label && (
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-violet-soft">
            {label}
          </div>
        )}
        <div className="flex flex-wrap items-baseline gap-2">
          <span
            className="font-display text-5xl font-bold leading-none text-aurora sm:text-6xl"
            data-count={count}
            data-count-prefix={countPrefix}
            data-count-suffix={countSuffix}
          >
            {value}
          </span>
          {unit && <span className="text-lg text-white sm:text-2xl">{unit}</span>}
        </div>
        {children && (
          <div className="mt-4 leading-relaxed text-white/75 [&_strong]:text-white">
            {children}
          </div>
        )}
        {barPct !== undefined && (
          <div className="mt-7 border-t border-white/10 pt-6">
            {(barLabel || barValue) && (
              <div className="mb-3 flex items-baseline justify-between gap-3.5">
                <span className="text-sm text-white/75">{barLabel}</span>
                {barValue && (
                  <span className="whitespace-nowrap font-display text-lg font-bold text-brand-violet-soft">
                    {barValue}
                  </span>
                )}
              </div>
            )}
            <div className="h-3.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-aurora transition-[width] duration-[1400ms] ease-[cubic-bezier(0.2,0,0,1)]"
                style={{ width: `${barPct}%` }}
                data-meter-width={barPct}
              />
            </div>
            {scale && (
              <div className="mt-2 flex justify-between gap-2 text-[0.72rem] text-white/45">
                <span>{scale[0]}</span>
                <span className="text-center">{scale[1]}</span>
                <span>{scale[2]}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Ngã rẽ 2 hướng (thua / thắng). */
export function Fork({
  items,
}: {
  items: { tone: 'lose' | 'win'; tag: string; title: string; points: string[] }[];
}) {
  return (
    <div className="not-prose my-8 grid gap-5 sm:grid-cols-2" data-reveal>
      {items.map((p, i) => {
        const lose = p.tone === 'lose';
        return (
          <div
            key={i}
            className={`rounded-xl border-[1.5px] bg-surface-elevated p-7 shadow-card ${
              lose
                ? 'border-rose-200 dark:border-rose-900/50'
                : 'border-violet-200 dark:border-violet-900/50'
            }`}
          >
            <div
              className={`mb-3 font-display text-xs font-semibold uppercase tracking-[0.1em] ${
                lose ? 'text-rose-500' : 'text-brand-indigo-deep'
              }`}
            >
              {/* Mũi tên trang trí (đã aria-hidden) để screen-reader không đọc ký tự ⬇/⬆ */}
              <span aria-hidden>{lose ? '⬇ ' : '⬆ '}</span>
              {p.tag}
            </div>
            <div className="mb-4 font-display text-lg font-semibold text-text-primary">
              {p.title}
            </div>
            <ul className="grid list-none gap-3 p-0">
              {p.points.map((pt, j) => (
                <li
                  key={j}
                  className="relative pl-7 text-[0.95rem] leading-snug text-text-secondary"
                >
                  <span
                    className={`absolute left-0 top-0 font-bold ${
                      lose ? 'text-rose-500' : 'text-brand-indigo-deep'
                    }`}
                    aria-hidden
                  >
                    {lose ? '✕' : '✓'}
                  </span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** Khung có thanh accent trái - dùng chung cho Steps & Checklist. */
function AccentBox({
  tag,
  heading,
  children,
}: {
  tag?: string;
  heading?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="not-prose relative my-9 overflow-hidden rounded-xl border-[1.5px] border-border-strong bg-surface-elevated p-7 shadow-card sm:p-8"
      data-reveal
    >
      <div className="absolute inset-y-0 left-0 w-[5px] bg-aurora" aria-hidden />
      {tag && (
        <div className="mb-3 inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-[0.08em] text-brand-indigo-deep">
          {tag}
        </div>
      )}
      {heading && (
        <div className="mb-5 font-display text-xl font-semibold text-text-primary">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

/** Lộ trình các bước (đánh số). */
export function Steps({
  tag,
  heading,
  items,
}: {
  tag?: string;
  heading?: string;
  items: { title: string; body: string }[];
}) {
  return (
    <AccentBox tag={tag} heading={heading}>
      <ol className="grid list-none gap-5 p-0">
        {items.map((s, i) => (
          <li key={i} className="relative pl-14">
            <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-[13px] bg-aurora font-display text-lg font-bold text-white shadow-[0_6px_16px_rgba(168,85,247,0.3)]">
              {i + 1}
            </span>
            <span className="mb-1 block font-display text-base font-semibold text-text-primary">
              {s.title}
            </span>
            <p className="m-0 text-[0.96rem] leading-relaxed text-text-secondary">
              {s.body}
            </p>
          </li>
        ))}
      </ol>
    </AccentBox>
  );
}

/** Checklist việc cần làm (tick gradient). */
export function Checklist({
  tag,
  heading,
  items,
}: {
  tag?: string;
  heading?: string;
  items: string[];
}) {
  return (
    <AccentBox tag={tag} heading={heading}>
      <ul className="grid list-none gap-4 p-0">
        {items.map((it, i) => (
          <li
            key={i}
            className="relative pl-9 text-[0.97rem] leading-relaxed text-text-primary"
          >
            <span
              className="absolute left-0 top-0.5 grid h-6 w-6 place-items-center rounded-md border-2 border-brand-violet bg-brand-violet/10 text-xs font-bold text-brand-violet"
              aria-hidden
            >
              ✓
            </span>
            <LeadText text={it} />
          </li>
        ))}
      </ul>
    </AccentBox>
  );
}
