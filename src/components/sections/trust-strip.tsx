"use client";

/**
 * trust-strip.tsx — Compact trust signals row between Process and FAQ.
 *
 * Desktop: flex row with separator pipes between signals.
 * Tablet (sm-md): 2×2 grid.
 * Mobile: 2×2 grid, compact.
 *
 * Icons: Lucide 24px, brand-violet color (cf. spec Phase 05).
 * Stagger fade-in on viewport entry.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { Clock, LifeBuoy, PlayCircle, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { TrustSignal, TrustStripContent } from '@/content/landing';
import { fadeInVariant, timelineContainer } from '@/lib/motion/timeline-variants';

type TrustStripProps = {
  content: TrustStripContent;
};

/** Map content key → Lucide icon component */
const ICON_MAP: Record<TrustSignal['icon'], LucideIcon> = {
  'shield-check': ShieldCheck,
  clock: Clock,
  'life-buoy': LifeBuoy,
  'play-circle': PlayCircle,
};

export function TrustStrip({ content }: TrustStripProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Cam kết dịch vụ"
      className="relative bg-surface-subtle py-8 sm:py-10"
    >
      {/* Top fade — blend from prev section's surface-base into surface-subtle */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-surface-base to-transparent"
      />
      {/* Bottom fade — blend surface-subtle out into next section's surface-base */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-surface-base to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        {/* Desktop: single row — hidden on mobile/tablet */}
        <motion.div
          variants={timelineContainer}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="hidden items-center justify-around gap-6 lg:flex"
          aria-hidden="false"
        >
          {content.signals.map((signal, index) => {
            const Icon = ICON_MAP[signal.icon];
            return (
              <div key={index} className="flex items-center gap-8">
                <motion.div
                  variants={fadeInVariant}
                  className="flex items-center gap-2"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-6 shrink-0 text-brand-violet"
                    strokeWidth={2}
                  />
                  <span className="font-body text-body-sm font-medium text-text-primary">
                    {signal.text}
                  </span>
                </motion.div>
                {/* Separator — hide after last item */}
                {index < content.signals.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="select-none text-border-strong"
                  >
                    |
                  </span>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Mobile/tablet: 2×2 grid — icon-left compact, equal-height cards */}
        <motion.div
          variants={timelineContainer}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid auto-rows-fr grid-cols-2 gap-2.5 sm:gap-3 lg:hidden"
        >
          {content.signals.map((signal, index) => {
            const Icon = ICON_MAP[signal.icon];
            return (
              <motion.div
                key={index}
                variants={fadeInVariant}
                className="flex h-full items-center gap-2.5 rounded-xl bg-surface-elevated px-3 py-2.5 shadow-sm sm:gap-3 sm:px-3.5 sm:py-3"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-violet/10 sm:size-9">
                  <Icon
                    aria-hidden="true"
                    className="size-[18px] text-brand-violet sm:size-5"
                    strokeWidth={2}
                  />
                </span>
                <span className="text-balance font-body text-[13px] font-medium leading-snug text-text-primary sm:text-body-sm">
                  {signal.text}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
