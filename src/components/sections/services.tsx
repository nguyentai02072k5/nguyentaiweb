"use client";

/**
 * services.tsx — Phase 04 Services section (S3).
 *
 * Renders 3 ServiceCard with D7 viewport stagger reveal.
 * Section anchor `#services` for nav + Hero secondary CTA `Xem cách hoạt động`.
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { ServicesContent } from '@/content/landing';
import { ServiceCardMotion } from '@/components/services/service-card';

const EASE_OUT: [number, number, number, number] = [0.2, 0, 0, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const headingVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};

type ServicesProps = {
  content: ServicesContent;
};

export function Services({ content }: ServicesProps) {
  const shouldReduceMotion = useReducedMotion();
  const initialState = shouldReduceMotion ? 'visible' : 'hidden';

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="relative bg-surface-base py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      {/* Subtle aurora wash background */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0 pointer-events-none
          bg-[radial-gradient(ellipse_at_50%_100%,rgba(99,102,241,0.06)_0%,transparent_60%)]
        "
      />

      <motion.div
        variants={containerVariants}
        initial={initialState}
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8"
      >
        {/* Heading */}
        <motion.div variants={headingVariants} className="text-center mb-12 lg:mb-14">
          <h2
            id="services-title"
            className="font-display text-h-1 text-text-primary mb-3 text-balance"
          >
            {content.title}
          </h2>
          <p className="font-body text-body-lg text-text-secondary max-w-2xl mx-auto">
            {content.subtitle}
          </p>
        </motion.div>

        {/* 3 cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          {content.modules.map((m) => (
            <ServiceCardMotion key={m.id} module={m} variants={cardVariants} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
