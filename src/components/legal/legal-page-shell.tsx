/**
 * legal-page-shell.tsx — shared chrome for /privacy & /terms.
 *
 * Aurora-themed hero header (eyebrow label, gradient title, meta pills) +
 * narrow content container. Server component, no client state needed.
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export type LegalMeta = {
  label: string;
  value: string;
};

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  meta: LegalMeta[];
  children: React.ReactNode;
};

export function LegalPageShell({
  eyebrow,
  title,
  intro,
  meta,
  children,
}: LegalPageShellProps) {
  return (
    <main id="main" className="relative bg-surface-base">
      {/* Aurora hero background — same recipe Hero/About use */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(168,85,247,0.18),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent_0%,rgba(99,102,241,0.4)_18%,rgba(168,85,247,0.55)_50%,rgba(236,72,153,0.4)_82%,transparent_100%)]"
      />

      <div className="relative mx-auto max-w-3xl px-5 sm:px-6 pt-8 pb-20 sm:pt-10 sm:pb-24 lg:pt-12">
        {/* Top bar: back link (left). Anchored as its own row, decoupled from the hero. */}
        <div className="flex items-center">
          <Link
            href="/"
            className="
              inline-flex items-center gap-1.5
              font-display text-sm font-semibold text-text-secondary
              hover:text-brand-violet
              transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2
              rounded-sm
            "
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Về trang chủ
          </Link>
        </div>

        {/* Hero block — centered, tight rhythm so eyebrow → title → intro → meta read as one unit */}
        <header className="mt-10 sm:mt-12 flex flex-col items-center text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-violet/30 bg-surface-elevated/80 px-3.5 py-1.5 backdrop-blur-sm shadow-[0_4px_16px_-8px_rgba(168,85,247,0.35)]">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-brand-violet shadow-[0_0_12px_rgba(168,85,247,0.6)]"
            />
            <span className="font-display text-label uppercase text-brand-violet">
              {eyebrow}
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-5 font-display text-h-1 sm:text-display-2 font-semibold text-text-primary text-balance">
            {title}
          </h1>

          {intro ? (
            <p className="mt-4 max-w-xl font-body text-body-lg text-text-secondary text-balance">
              {intro}
            </p>
          ) : null}

          {/* Meta pills — centered row, wraps on narrow screens */}
          {meta.length > 0 ? (
            <dl className="mt-7 flex flex-wrap justify-center gap-2.5">
              {meta.map((item) => (
                <div
                  key={item.label}
                  className="
                    inline-flex items-center gap-2
                    rounded-full border border-border-default bg-surface-elevated/80
                    px-3 py-1.5 backdrop-blur-sm
                    shadow-[0_2px_8px_-4px_rgba(99,102,241,0.18)]
                  "
                >
                  <dt className="font-display text-label uppercase text-text-tertiary">
                    {item.label}
                  </dt>
                  <dd className="font-body text-sm font-medium text-text-primary">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </header>

        {/* Aurora hairline divider between header and content */}
        <div
          aria-hidden="true"
          className="mt-12 h-px w-full bg-[linear-gradient(90deg,transparent_0%,rgba(168,85,247,0.35)_50%,transparent_100%)]"
        />

        {/* Content */}
        <div className="mt-10 flex flex-col gap-10 sm:gap-12">{children}</div>
      </div>
    </main>
  );
}
