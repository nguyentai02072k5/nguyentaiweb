"use client";

/**
 * hero.tsx - Hero section (S1).
 *
 * Layout:
 *   Desktop (≥ lg): 2-col grid - text left, photo + floating badges right
 *   Mobile (< lg): stack column - eyebrow → headline → body → USP → photo → CTAs → bullets → pills
 *
 * Animation tiers (D8):
 *   Desktop: full Framer Motion stagger C1
 *   Mobile:  reduced stagger (faster total), 1-2 blobs only (handled in HeroAuroraBg)
 *   Reduced-motion: opacity-only fade, no transform, no blob drift
 *
 * CTA buttons carry data-cta-location for analytics (D3) and aria-label for a11y.
 * Floating badges: desktop only, aria-label set on each badge (carry trust signal content).
 * Mobile pills: mobile only, replace floating badges (D5).
 */

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import type { HeroContent } from '@/content/landing';
import { trackCtaClick } from '@/lib/analytics/track-cta-click';
import { HeroAuroraBg } from '@/components/decoration/hero-aurora-bg';
import { FloatingBadge } from '@/components/decoration/floating-badge';
import { HeroSparkles } from '@/components/decoration/hero-sparkles';
import { SketchUnderline } from '@/components/decoration/sketch-underline';
import { MobilePills } from '@/components/ui/mobile-pills';
import { UspCloseBlock } from '@/components/ui/usp-close-block';
import {
  headlineWordContainerVariants,
  headlineWordItemVariants,
  heroBodyVariants,
  heroContainerVariants,
  heroCtaVariants,
  heroEyebrowVariants,
  heroPhotoVariants,
  heroPillsVariants,
  heroTrustContainerVariants,
  heroUspVariants,
  staggerItemVariants,
} from '@/lib/motion/hero-variants';

type HeroProps = {
  content: HeroContent;
};

/** Accent checkmark colors cycle: indigo → violet → pink */
const BULLET_ACCENT_COLORS = [
  'text-brand-indigo',
  'text-brand-violet',
  'text-brand-pink',
] as const;

export function Hero({ content }: HeroProps) {
  const shouldReduceMotion = useReducedMotion();
  // Reduced-motion: skip transforms entirely - mount at final state instantly
  const initialState = shouldReduceMotion ? 'visible' : 'hidden';
  const visibleVariant = 'visible';

  return (
    <section
      id="hero"
      aria-labelledby="hero-headline"
      className="relative flex items-center overflow-hidden"
    >
      {/* Background: 6 Aurora layers */}
      <HeroAuroraBg />

      {/* Content container */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8 pt-6 pb-10 sm:pt-8 sm:pb-12 lg:pt-10 lg:pb-14">
        <div className="grid lg:grid-cols-[1.55fr_1fr] gap-12 lg:gap-10 xl:gap-14 items-center">

          {/* ── Left column: text content ── */}
          <motion.div
            variants={heroContainerVariants}
            initial={initialState}
            animate={visibleVariant}
            className="flex flex-col"
          >
            {/* Eyebrow — Phase 1 (t=0 → 0.3s) */}
            <motion.p
              variants={heroEyebrowVariants}
              className="
                inline-flex items-center gap-2 self-start
                rounded-full bg-surface-elevated/80 backdrop-blur
                border border-border-default shadow-sm
                px-4 py-2 mb-6
                font-display text-label uppercase tracking-widest
                text-brand-violet
              "
            >
              <span
                className="size-2 rounded-full bg-brand-pink animate-pulse motion-reduce:animate-none"
                aria-hidden="true"
              />
              {content.eyebrow}
            </motion.p>

            {/* Headline — Phase 2 (t=0.3 → 2.0s) 4 lines stagger 0.4s + F1 sketch */}
            <motion.h1
              id="hero-headline"
              variants={headlineWordContainerVariants}
              className="font-display text-display-1 lg:text-[clamp(3rem,5.8vw,4.75rem)] leading-[1.04] tracking-tight mb-5 text-text-primary"
            >
              {/* Line 1 - solid ink */}
              <motion.span
                variants={headlineWordItemVariants}
                className="block"
              >
                {content.headlineParts[0]}
              </motion.span>

              {/* Line 2 - solid ink */}
              <motion.span
                variants={headlineWordItemVariants}
                className="block"
              >
                Có ngay trợ lý
              </motion.span>

              {/* Line 3 - keyword "chot sale" aurora gradient + F1 underline as focal point */}
              <motion.span
                variants={headlineWordItemVariants}
                className="block"
              >
                <span className="relative inline-block whitespace-nowrap">
                  <span className="text-aurora">chốt sale</span>
                  {/* Phase 3 — Sketch underline starts after title done (t≈1.5s) */}
                  <SketchUnderline delay={1.5} duration={1.2} />
                </span>
              </motion.span>

              {/* Line 4 - solid ink, single-line force, bolder weight for resolute closing beat */}
              <motion.span
                variants={headlineWordItemVariants}
                className="block whitespace-nowrap font-extrabold lg:text-[1.06em] -tracking-[0.045em]"
              >
                không nghỉ ngơi.
              </motion.span>

            </motion.h1>

            {/* Body text — Phase 4 (t=3.2s) */}
            <motion.p
              variants={heroBodyVariants}
              className="font-body text-body-lg text-text-secondary max-w-xl mb-2 leading-relaxed"
            >
              {content.body}
            </motion.p>

            {/* USP Close block — Phase 4 (t=3.35s) */}
            <motion.div variants={heroUspVariants}>
              <UspCloseBlock
                firstLine="→ Đặc biệt, không phụ thuộc Tài."
                secondLine="Bàn giao toàn bộ - Tài hướng dẫn, hỗ trợ anh/chị trong quá trình sử dụng trọn đời."
              />
            </motion.div>

            {/* CTA buttons — Phase 4 (t=3.50s) */}
            <motion.div
              variants={heroCtaVariants}
              className="flex flex-col sm:flex-row gap-3 mb-8"
            >
              {/* Primary CTA */}
              <a
                href={content.primaryCta.href}
                data-cta-location={content.primaryCta.analyticsId}
                aria-label={content.primaryCta.ariaLabel}
                onClick={() => trackCtaClick(content.primaryCta.analyticsId)}
                className="
                  group relative overflow-hidden
                  rounded-full
                  bg-aurora animate-aurora bg-[length:200%_200%]
                  px-7 py-4
                  font-display font-semibold text-text-on-brand text-sm sm:text-base
                  shadow-glow-violet
                  hover:shadow-glow-pink hover:scale-[1.03]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2
                  transition-all duration-base
                  text-center
                  motion-reduce:animate-none
                "
              >
                {/* E1 shine sweep - desktop hover, GPU transform only */}
                <span
                  aria-hidden="true"
                  className="
                    absolute inset-0 pointer-events-none
                    bg-[linear-gradient(120deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)]
                    translate-x-[-100%]
                    group-hover:translate-x-[200%]
                    transition-transform duration-700 ease-in-out
                    motion-reduce:hidden
                  "
                />
                <span className="relative z-10">{content.primaryCta.label}</span>
              </a>

              {/* Secondary CTA */}
              <a
                href={content.secondaryCta.href}
                data-cta-location={content.secondaryCta.analyticsId}
                aria-label={content.secondaryCta.ariaLabel}
                onClick={() => trackCtaClick(content.secondaryCta.analyticsId)}
                className="
                  rounded-full
                  border-2 border-brand-indigo/40
                  bg-surface-elevated/60 backdrop-blur
                  px-7 py-4
                  font-display font-semibold text-brand-indigo text-sm sm:text-base
                  hover:border-brand-violet hover:text-brand-violet hover:bg-surface-elevated/80
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2
                  transition-all duration-base
                  text-center
                "
              >
                {content.secondaryCta.label}
              </a>
            </motion.div>

            {/* Trust bullets — Phase 4 (t=3.65s) with internal stagger 0.1s per bullet */}
            <motion.ul
              variants={heroTrustContainerVariants}
              className="flex flex-col gap-2"
              aria-label="Cam kết dịch vụ"
            >
              {content.trustBullets.map((bullet, i) => (
                <motion.li
                  key={bullet}
                  variants={staggerItemVariants}
                  className="flex items-start gap-2 font-body text-body-sm text-text-secondary"
                >
                  <span
                    className={`shrink-0 font-bold mt-0.5 ${BULLET_ACCENT_COLORS[i % BULLET_ACCENT_COLORS.length]}`}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  {bullet}
                </motion.li>
              ))}
            </motion.ul>

            {/* Mobile pills — Phase 4 (t=3.80s), D5: visible only on mobile (< md) */}
            <motion.div variants={heroPillsVariants}>
              <MobilePills pills={content.mobilePills} />
            </motion.div>
          </motion.div>

          {/* ── Right column: photo + B4 sparkles + floating badges (desktop only) ── */}
          <motion.div
            variants={heroPhotoVariants}
            initial={initialState}
            animate={visibleVariant}
            className="relative hidden lg:flex lg:justify-end items-center"
          >
            {/* Photo container - sized + pushed right for better balance (owner feedback) */}
            <div className="relative w-[400px] xl:w-[460px]">
              {/* Glow halo behind photo */}
              <div
                aria-hidden="true"
                className="
                  absolute inset-4
                  rounded-[40%_60%_55%_45%/45%_55%_60%_40%]
                  bg-gradient-to-br from-brand-violet/25 via-brand-pink/15 to-brand-indigo/20
                  blur-2xl
                  animate-blob-morph motion-reduce:animate-none
                "
              />

              {/* B4 - Floating sparkles around photo (desktop only, motion-reduce:hidden) */}
              <HeroSparkles />

              {/* Owner portrait - raw photo (RMBG skipped per owner) */}
              <div className="relative rounded-3xl overflow-hidden shadow-lg border border-border-default/40">
                <Image
                  src="/brand/owner-tai.png"
                  alt="Nguyễn Văn Tài - AI Automation Specialist, người trực tiếp demo và làm việc với anh/chị"
                  width={460}
                  height={575}
                  priority
                  loading="eager"
                  fetchPriority="high"
                  quality={90}
                  sizes="(max-width: 1280px) 400px, 460px"
                  className="w-full h-auto object-cover object-top"
                  style={{ aspectRatio: '4/5' }}
                />
              </div>

              {/* Floating badges - 3 trust signals, desktop only */}
              <FloatingBadge
                badge={content.floatingBadgesDesktop[0]}
                className="-top-4 -left-12"
                animationDelay="0s"
              />
              <FloatingBadge
                badge={content.floatingBadgesDesktop[1]}
                className="top-1/2 -translate-y-1/2 -right-14"
                animationDelay="0.3s"
              />
              <FloatingBadge
                badge={content.floatingBadgesDesktop[2]}
                className="-bottom-4 left-10"
                animationDelay="0.6s"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
