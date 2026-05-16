"use client";

/**
 * process-journey.tsx — Process Journey section (S5).
 *
 * Desktop (md+): 2-col alternating grid with centered animated SVG spine.
 *   Odd steps (index 0,2,4) → left column; even steps (index 1,3,5) → right column.
 * Mobile: single column with border-l accent line and dot markers.
 *
 * Scroll-driven SVG spine via TimelineSpine component (desktop only).
 * Stagger reveal cards whileInView, viewport once.
 */

import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ProcessContent } from '@/content/landing';
import { StepCard } from '@/components/process/step-card';
import { StepNumberBadge } from '@/components/process/step-number-badge';
import { TimelineSpine } from '@/components/process/timeline-spine';
import {
  timelineContainer,
  stepCardLeft,
  stepCardRight,
  stepCardMobile,
} from '@/lib/motion/timeline-variants';

type ProcessJourneyProps = {
  content: ProcessContent;
};

export function ProcessJourney({ content }: ProcessJourneyProps) {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-labelledby="process-title"
      className="relative scroll-mt-24 overflow-hidden bg-surface-base py-10 sm:py-12 lg:py-14"
    >
      {/* Aurora background — boosted to make glass cards pop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,rgba(168,85,247,0.22),transparent_55%),radial-gradient(ellipse_at_15%_50%,rgba(99,102,241,0.18),transparent_50%),radial-gradient(ellipse_at_85%_85%,rgba(236,72,153,0.14),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
        {/* Section header — compact */}
        <div className="mb-7 text-center lg:mb-9">
          <h2
            id="process-title"
            className="font-display text-h-2 font-semibold text-text-primary text-balance"
          >
            {content.title}
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl font-body text-body-sm text-text-secondary">
            {content.subtitle}
          </p>
        </div>

        {/* ── DESKTOP LAYOUT (md+) ─────────────────────────────────── */}
        <div className="hidden md:block">
          <motion.div
            variants={timelineContainer}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative grid grid-cols-2 gap-x-10 gap-y-5"
          >
            {/* Animated spine — anchored to grid height, centered between columns */}
            <TimelineSpine sectionRef={sectionRef} />

            {content.steps.map((step, index) => {
              const isLeft = index % 2 === 0;
              return (
                <motion.div
                  key={step.id}
                  variants={isLeft ? stepCardLeft : stepCardRight}
                  /* Odd steps in left col, even steps in right col (CSS grid row auto) */
                  className={isLeft ? 'col-start-1' : 'col-start-2'}
                >
                  <StepCard step={step} index={index} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* ── MOBILE LAYOUT (< md) ─────────────────────────────────────────
            Compact: numbered badges live OUTSIDE the card, centered on the spine.
            Gutter pl-14 (56px) gives badge room; spine at left-7 (center x≈29px).
            Badge size-10 (40px) centered: -left-12 from step wrapper (which starts at x=56). */}
        <div className="relative md:hidden">
          {/* Vertical accent line — aurora gradient strip */}
          <div
            aria-hidden="true"
            className="bg-aurora pointer-events-none absolute left-7 top-3 bottom-3 w-0.5 opacity-50"
          />

          <motion.div
            variants={timelineContainer}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="flex flex-col gap-3 pl-14 sm:gap-4"
          >
            {content.steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Number badge centered on spine (replaces dot marker) */}
                <div className="pointer-events-none absolute -left-12 top-2.5 z-10">
                  <StepNumberBadge number={step.number} />
                </div>
                <motion.div variants={stepCardMobile}>
                  <StepCard step={step} index={index} />
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
