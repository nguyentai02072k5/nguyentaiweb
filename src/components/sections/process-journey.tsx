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
      className="relative scroll-mt-24 overflow-hidden bg-surface-base py-16 sm:py-20 lg:py-24"
    >
      {/* Subtle background aurora tint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,rgba(168,85,247,0.07),transparent_60%),radial-gradient(ellipse_at_20%_100%,rgba(99,102,241,0.06),transparent_50%)]"
      />

      <div className="relative mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12 text-center lg:mb-16">
          <h2
            id="process-title"
            className="font-display text-h-1 font-semibold text-text-primary text-balance"
          >
            {content.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-body-lg text-text-secondary">
            {content.subtitle}
          </p>
        </div>

        {/* ── DESKTOP LAYOUT (md+) ─────────────────────────────────── */}
        <div className="relative hidden md:block">
          {/* Animated SVG spine centered between columns */}
          <TimelineSpine sectionRef={sectionRef} />

          <motion.div
            variants={timelineContainer}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-2 gap-x-12 gap-y-8"
          >
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

        {/* ── MOBILE LAYOUT (< md) ─────────────────────────────────── */}
        <div className="relative md:hidden">
          {/* Vertical accent line — aurora gradient strip */}
          <div
            aria-hidden="true"
            className="bg-aurora pointer-events-none absolute left-5 top-0 h-full w-0.5 opacity-40"
          />

          <motion.div
            variants={timelineContainer}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="flex flex-col gap-6 pl-10"
          >
            {content.steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Dot marker on the border-l line */}
                <div
                  aria-hidden="true"
                  className="absolute -left-[2.125rem] top-5 size-3 rounded-full bg-brand-violet ring-2 ring-surface-base"
                />
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
