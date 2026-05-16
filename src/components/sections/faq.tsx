"use client";

/**
 * faq.tsx — FAQ section (S7) với custom single-active accordion.
 *
 * Pattern: useState single activeIndex (Q1 mở mặc định), custom button + AnimatePresence
 * thay cho shadcn Accordion. Animation: Plus rotate-45, content height 0→auto + opacity với
 * easeInOut 0.3s delay 0.14s. Final CTA link tới #booking với analytics tracking.
 */

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FaqAccordionItem } from '@/components/faq/faq-item';
import type { FaqContent } from '@/content/landing';
import { fadeInVariant, timelineContainer } from '@/lib/motion/timeline-variants';

type FaqProps = {
  content: FaqContent;
};

export function Faq({ content }: FaqProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  function handleToggle(index: number) {
    setActiveIndex((prev) => (prev === index ? null : index));
  }

  function handleFinalCtaClick() {
    if (process.env.NODE_ENV === 'development') {
      console.log('[CTA]', { event: 'cta_click', cta_location: content.finalCta.analyticsId });
    }
    if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
      (window.dataLayer as Array<Record<string, unknown>>).push({
        event: 'cta_click',
        cta_location: content.finalCta.analyticsId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative scroll-mt-24 bg-surface-base py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        {/* Header */}
        <motion.div
          variants={timelineContainer}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-10 text-center"
        >
          <motion.h2
            variants={fadeInVariant}
            id="faq-title"
            className="font-display text-h-1 font-semibold text-text-primary text-balance"
          >
            {content.title}
          </motion.h2>
          <motion.p
            variants={fadeInVariant}
            className="mx-auto mt-4 max-w-xl font-body text-body-lg text-text-secondary"
          >
            {content.subtitle}
          </motion.p>
        </motion.div>

        {/* Accordion container — single rounded panel với divider */}
        <motion.div
          variants={fadeInVariant}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="rounded-2xl border border-border-default bg-surface-elevated p-2 shadow-sm sm:p-3"
        >
          {content.items.map((item, index) => (
            <FaqAccordionItem
              key={item.id}
              item={item}
              isOpen={activeIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          variants={fadeInVariant}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="mt-10 text-center"
        >
          <a
            href={content.finalCta.href}
            onClick={handleFinalCtaClick}
            className="inline-flex items-center gap-2 rounded-full bg-aurora px-8 py-3.5 font-display text-base font-semibold text-white shadow-glow-violet transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2"
            aria-label={content.finalCta.label}
          >
            {content.finalCta.label}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
