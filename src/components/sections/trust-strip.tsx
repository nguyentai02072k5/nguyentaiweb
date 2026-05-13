"use client";

/**
 * trust-strip.tsx — Compact trust signals row between Process and FAQ.
 *
 * Desktop: flex row with separator pipes between signals.
 * Tablet (sm-md): 2×2 grid.
 * Mobile: 2×2 grid, compact.
 *
 * Stagger fade-in on viewport entry.
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { TrustStripContent } from '@/content/landing';
import { fadeInVariant, timelineContainer } from '@/lib/motion/timeline-variants';

type TrustStripProps = {
  content: TrustStripContent;
};

export function TrustStrip({ content }: TrustStripProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-label="Cam kết dịch vụ"
      className="bg-surface-subtle py-8 sm:py-10"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        {/* Desktop: single row — hidden on mobile/tablet */}
        <motion.div
          variants={timelineContainer}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="hidden items-center justify-around gap-6 lg:flex"
          aria-hidden="false"
        >
          {content.signals.map((signal, index) => (
            <div key={index} className="flex items-center gap-8">
              <motion.div
                variants={fadeInVariant}
                className="flex items-center gap-2"
              >
                <span aria-hidden="true" className="text-xl">
                  {signal.icon}
                </span>
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
          ))}
        </motion.div>

        {/* Mobile/tablet: 2×2 grid */}
        <motion.div
          variants={timelineContainer}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:hidden"
        >
          {content.signals.map((signal, index) => (
            <motion.div
              key={index}
              variants={fadeInVariant}
              className="flex items-start gap-2 rounded-xl bg-surface-elevated p-3 shadow-sm sm:p-4"
            >
              <span aria-hidden="true" className="mt-0.5 shrink-0 text-lg sm:text-xl">
                {signal.icon}
              </span>
              <span className="font-body text-xs font-medium leading-snug text-text-primary sm:text-body-sm">
                {signal.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
