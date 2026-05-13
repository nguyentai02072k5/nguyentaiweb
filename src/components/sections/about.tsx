"use client";

/**
 * about.tsx - About section (S6).
 *
 * Layout:
 *   Centered column: avatar → title → 4 story paragraphs → bullets → inline CTA
 *
 * Story paragraphs use segment array rendering (NO markdown parser, D1 synthesis).
 * Avatar is 96-120px tight face crop from same hero portrait (D6 synthesis).
 * Bullets animate in with D7 viewport stagger (disabled on reduced-motion).
 * Inline CTA carries data-cta-location + aria-label for analytics + a11y (D3).
 *
 * Pink is accent-only: StoryHighlight uses gradient underline, not text colour.
 * Body text stays text-secondary (#52527a) throughout - no contrast issues.
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { AboutContent } from '@/content/landing';
import { trackCtaClick } from '@/lib/analytics/track-cta-click';
import { AvatarSmall } from '@/components/about/avatar-small';
import { StoryParagraph } from '@/components/about/story-paragraph';

type AboutProps = {
  content: AboutContent;
};

// Typed tuple - FM v12 BezierDefinition requires exactly 4 numbers
const EASE_OUT: [number, number, number, number] = [0.2, 0, 0, 1];

/** Section-level stagger container */
const aboutContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.04 } },
};

/** Fade-in-up for section elements */
const aboutItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

const aboutTitleVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

const avatarRevealVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.34, 1.56, 0.64, 1] },
  },
};

const storyCardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.985, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE_OUT },
  },
};

const dividerVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

const bulletVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: EASE_OUT },
  },
};

/** Bullet accent characters */
const BULLET_CHAR = '✦';

export function About({ content }: AboutProps) {
  const shouldReduceMotion = useReducedMotion();
  // Reduced-motion: start at final state, no stagger transforms
  const initialState = shouldReduceMotion ? 'visible' : 'hidden';
  const visibleVariant = 'visible';

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative bg-surface-base py-12 sm:py-16 lg:py-20 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_50%_0%,rgba(168,85,247,0.12),transparent_68%)]"
      />

      <motion.div
        variants={aboutContainerVariants}
        initial={initialState}
        whileInView={visibleVariant}
        viewport={{ once: true, margin: '-80px' }}
        className="relative mx-auto max-w-2xl px-5 sm:px-6 flex flex-col items-center gap-10"
      >
        {/* Avatar - 108px tight face crop */}
        <motion.div variants={avatarRevealVariants}>
          <AvatarSmall caption={content.photoCaption} />
        </motion.div>

        {/* Section title */}
        <motion.h2
          id="about-title"
          variants={aboutTitleVariants}
          className="font-display text-h-1 text-text-primary text-center text-balance"
        >
          {content.title}
        </motion.h2>

        {/* Story paragraphs - 4 segments with sentence-label badges */}
        <motion.div
          variants={aboutContainerVariants}
          className="flex flex-col gap-6 w-full"
        >
          {content.story.map((para) => (
            <motion.div
              key={para.label}
              variants={storyCardVariants}
              className="
                group/story relative overflow-hidden rounded-[20px]
                border border-border-default/75
                bg-surface-elevated/72
                px-5 py-5 shadow-[0_18px_46px_-34px_rgba(99,102,241,0.45)]
                transition-colors duration-base
                hover:border-brand-violet/35
                sm:px-6 sm:py-5
              "
            >
              <span
                aria-hidden="true"
                className="
                  absolute inset-y-4 left-0 w-[3px] rounded-r-full
                  bg-gradient-to-b from-brand-indigo via-brand-violet to-brand-pink
                  opacity-70
                "
              />
              <span
                aria-hidden="true"
                className="
                  pointer-events-none absolute inset-x-0 top-0 h-px
                  bg-gradient-to-r from-transparent via-brand-violet/35 to-transparent
                "
              />
              <StoryParagraph paragraph={para} />
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.hr
          variants={dividerVariants}
          className="w-16 origin-left border-0 border-t-2 border-brand-violet/30 self-start"
        />

        {/* Bullets - 4 items with ✦ marker, D7 viewport stagger */}
        <motion.ul
          variants={aboutContainerVariants}
          aria-label="Điểm mạnh cốt lõi"
          className="flex flex-col gap-3 w-full"
        >
          {content.bullets.map((bullet, i) => (
            <motion.li
              key={i}
              variants={bulletVariants}
              className="flex items-start gap-3 font-body text-base text-text-primary"
            >
              <span
                className="shrink-0 text-brand-violet font-bold mt-0.5 text-sm"
                aria-hidden="true"
              >
                {BULLET_CHAR}
              </span>
              {bullet}
            </motion.li>
          ))}
        </motion.ul>

        {/* Inline CTA */}
        <motion.div variants={aboutItemVariants} className="w-full">
          <a
            href={content.inlineCta.href}
            data-cta-location={content.inlineCta.analyticsId}
            aria-label={content.inlineCta.ariaLabel}
            onClick={() => trackCtaClick(content.inlineCta.analyticsId)}
            className="
              inline-flex items-center gap-2
              font-display font-semibold text-base
              text-brand-indigo
              hover:text-brand-violet
              underline-offset-4 hover:underline
              transition-colors duration-base
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 rounded-sm
            "
          >
            {content.inlineCta.label}
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
