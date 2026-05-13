"use client";

/**
 * service-card.tsx — Phase 04 Service module card.
 *
 * 3 cards rendered side-by-side desktop, stacked mobile.
 * Each card has signature accent color (indigo / violet / gradient).
 * Highlight feature (★) gets gradient strip styling.
 *
 * Hover (desktop): lift + accent shadow-glow. No animation on reduced-motion.
 * Reveal: parent <Services> handles D7 viewport stagger.
 */

import { motion } from 'framer-motion';
import type { ServiceModule } from '@/content/landing';
import { trackCtaClick } from '@/lib/analytics/track-cta-click';

type ServiceCardProps = {
  module: ServiceModule;
};

/** Maps accent token to Tailwind class chunks for icon bg, border, glow */
const ACCENT_STYLES: Record<
  ServiceModule['accent'],
  {
    iconBg: string;
    border: string;
    indexBadge: string;
    glow: string;
  }
> = {
  indigo: {
    iconBg: 'bg-brand-indigo/12',
    border: 'hover:border-brand-indigo/50',
    indexBadge: 'text-brand-indigo bg-brand-indigo/10',
    glow: 'hover:shadow-glow-indigo',
  },
  violet: {
    iconBg: 'bg-brand-violet/12',
    border: 'hover:border-brand-violet/50',
    indexBadge: 'text-brand-violet bg-brand-violet/10',
    glow: 'hover:shadow-glow-violet',
  },
  gradient: {
    iconBg: 'bg-aurora-soft',
    border: 'hover:border-brand-pink/50',
    indexBadge: 'text-brand-pink bg-brand-pink/10',
    glow: 'hover:shadow-glow-pink',
  },
};

export function ServiceCard({ module: m }: ServiceCardProps) {
  const a = ACCENT_STYLES[m.accent];

  return (
    <article
      className={`
        group relative flex flex-col gap-5
        h-full
        rounded-3xl
        bg-surface-elevated
        border border-border-default ${a.border}
        p-7 lg:p-8
        shadow-card
        transition-all duration-base motion-reduce:transition-none
        hover:-translate-y-1 ${a.glow} hover:shadow-lg
        motion-reduce:hover:translate-y-0
      `}
    >
      {/* Header: icon area + index badge */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={`
            flex items-center justify-center
            w-16 h-16 lg:w-20 lg:h-20 rounded-2xl
            ${a.iconBg}
            text-4xl lg:text-5xl
            transition-transform duration-base
            group-hover:scale-105 motion-reduce:group-hover:scale-100
          `}
          aria-hidden="true"
        >
          {m.features[0]?.icon ?? '✦'}
        </div>
        <span
          className={`
            inline-flex items-center
            px-2.5 py-1 rounded-full
            font-display text-[11px] font-bold tracking-wider
            ${a.indexBadge}
          `}
        >
          {String(m.index).padStart(2, '0')} / 03
        </span>
      </div>

      {/* Title + tagline */}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-h-2 text-text-primary">{m.title}</h3>
        <p className="font-body text-body-sm text-text-secondary italic">
          {m.tagline}
        </p>
      </div>

      {/* Features list */}
      <ul className="flex flex-col gap-2.5 flex-1" aria-label={`Tính năng ${m.title}`}>
        {m.features.map((f, i) =>
          f.highlight ? (
            <li
              key={i}
              className="
                flex items-start gap-3
                px-3 py-2 -mx-1
                rounded-xl
                bg-aurora-soft
                border-l-2 border-brand-pink
                font-body text-body-sm text-text-primary
              "
            >
              <span aria-hidden="true" className="shrink-0 text-lg leading-tight">
                {f.icon}
              </span>
              <span className="font-semibold">{f.label}</span>
              <span
                aria-hidden="true"
                className="shrink-0 text-brand-pink text-base leading-tight ml-auto"
                title="Điểm khác biệt"
              >
                ★
              </span>
            </li>
          ) : (
            <li
              key={i}
              className="flex items-start gap-3 font-body text-body-sm text-text-secondary"
            >
              <span aria-hidden="true" className="shrink-0 text-base leading-tight">
                {f.icon}
              </span>
              <span>{f.label}</span>
            </li>
          ),
        )}
      </ul>

      {/* CTA */}
      <div className="pt-2 border-t border-border-default/60">
        <a
          href={m.cta.href}
          data-cta-location={m.cta.analyticsId}
          aria-label={m.cta.ariaLabel}
          onClick={() => trackCtaClick(m.cta.analyticsId)}
          className="
            inline-flex items-center gap-1.5
            font-display font-semibold text-sm
            text-brand-indigo hover:text-brand-violet
            transition-colors duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet rounded-md
          "
        >
          {m.cta.label}
        </a>
      </div>
    </article>
  );
}

/** Motion wrapper — staggered viewport reveal D7 */
type MotionVariantsProp = Parameters<typeof motion.div>[0]['variants'];

export function ServiceCardMotion({
  module: m,
  variants,
}: ServiceCardProps & { variants?: MotionVariantsProp }) {
  return (
    <motion.div variants={variants} className="h-full">
      <ServiceCard module={m} />
    </motion.div>
  );
}
