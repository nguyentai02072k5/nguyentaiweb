"use client";

/**
 * about.tsx - About section (S6).
 *
 * Desktop layout (md+):
 *   Centered column: avatar → title → 4 story paragraphs → divider → bullets → inline CTA
 *
 * Mobile layout (< md, compact — reduce scroll length):
 *   avatar → title → 4 accordion items (bullet header + story panel, single-active) → inline CTA
 *
 * Mobile accordion: bullets[i] pairs 1:1 with story[i] via index alignment in landing.ts.
 * Clicking a bullet expands its corresponding story paragraph below.
 *
 * Pink is accent-only: StoryHighlight uses gradient underline, not text colour.
 * Body text stays text-secondary (#52527a) throughout - no contrast issues.
 */

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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
  // Mobile single-active accordion: which bullet's story is open (null = all closed)
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  function toggleMobile(i: number) {
    setActiveIndex((prev) => (prev === i ? null : i));
  }

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative bg-surface-base py-10 sm:py-14 lg:py-18 overflow-hidden"
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
        <motion.div variants={avatarRevealVariants} className="order-1">
          <AvatarSmall caption={content.photoCaption} />
        </motion.div>

        {/* Section title */}
        <motion.h2
          id="about-title"
          variants={aboutTitleVariants}
          className="order-2 font-display text-h-1 text-text-primary text-center text-balance"
        >
          {content.title}
        </motion.h2>

        {/* ─────────────────────────────────────────────────────────────
            MOBILE (< md): 4 accordion items — bullet header + story panel
            Each bullet has its own "dropdown nổi bật" expanding to story[i]
            ───────────────────────────────────────────────────────────── */}
        <motion.ul
          variants={aboutContainerVariants}
          aria-label="Điểm mạnh cốt lõi"
          className="order-3 md:hidden w-full flex flex-col gap-2"
        >
          {content.bullets.map((bullet, i) => {
            const isOpen = activeIndex === i;
            const story = content.story[i];
            const panelId = `about-mobile-panel-${i}`;
            const buttonId = `about-mobile-button-${i}`;
            return (
              <motion.li
                key={i}
                variants={bulletVariants}
                className={`
                  group/bullet overflow-hidden rounded-2xl border bg-surface-elevated/70 backdrop-blur-sm
                  transition-colors duration-base
                  ${isOpen ? 'border-brand-violet/45 shadow-[0_8px_28px_-12px_rgba(99,102,241,0.28)]' : 'border-border-default/60'}
                `}
              >
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => toggleMobile(i)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="
                    flex w-full items-start gap-3 px-4 py-3.5 text-left
                    transition-colors duration-base
                    hover:bg-brand-violet/[0.04]
                    focus-visible:outline-none focus-visible:bg-brand-violet/[0.06]
                  "
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 mt-0.5 text-brand-violet font-bold text-sm"
                  >
                    {BULLET_CHAR}
                  </span>
                  <span className="flex-1 font-body text-sm sm:text-base font-medium text-text-primary leading-snug">
                    {bullet}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className={`mt-0.5 h-5 w-5 shrink-0 text-brand-violet transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && story && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { duration: 0.32, ease: EASE_OUT }
                      }
                      className="overflow-hidden"
                    >
                      <div className="relative px-4 pb-4 pt-1">
                        <span
                          aria-hidden="true"
                          className="
                            absolute inset-y-3 left-4 w-[3px] rounded-r-full
                            bg-gradient-to-b from-brand-indigo via-brand-violet to-brand-pink
                            opacity-70
                          "
                        />
                        <div className="pl-4">
                          <StoryParagraph paragraph={story} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </motion.ul>

        {/* ─────────────────────────────────────────────────────────────
            DESKTOP (md+): full story stack + divider + bullets list
            ───────────────────────────────────────────────────────────── */}
        <motion.div
          variants={aboutContainerVariants}
          className="hidden md:flex md:order-3 flex-col gap-6 w-full"
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

        {/* Desktop divider */}
        <motion.hr
          variants={dividerVariants}
          className="hidden md:block md:order-4 w-16 origin-left border-0 border-t-2 border-brand-violet/30 self-start"
        />

        {/* Desktop bullets list */}
        <motion.ul
          variants={aboutContainerVariants}
          aria-label="Điểm mạnh cốt lõi"
          className="hidden md:flex md:order-5 flex-col gap-3 w-full"
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
        <motion.div variants={aboutItemVariants} className="order-6 w-full">
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
