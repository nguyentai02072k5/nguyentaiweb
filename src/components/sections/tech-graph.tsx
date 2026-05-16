"use client";

/**
 * tech-graph.tsx - Phase 04 Tech Graph section (S4).
 *
 * Desktop renders a high-contrast workflow console. Mobile uses a vertical
 * stack so labels remain readable without horizontal scroll.
 */

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, Cpu } from 'lucide-react';
import type { TechGraphContent } from '@/content/landing';
import { GraphSvg } from '@/components/tech-graph/graph-svg';
import { GraphNodeIcon } from '@/components/tech-graph/graph-node';
import { Sparkles } from '@/components/ui/sparkles';
import { useDesktopViewport } from '@/hooks/use-desktop-viewport';

const EASE_OUT: [number, number, number, number] = [0.2, 0, 0, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

type TechGraphProps = {
  content: TechGraphContent;
};

export function TechGraph({ content }: TechGraphProps) {
  const shouldReduceMotion = useReducedMotion();
  const initialState = shouldReduceMotion ? 'visible' : 'hidden';
  const isDesktop = useDesktopViewport();
  // Tune density per viewport — denser sparkle wash on desktop, lighter on
  // mobile for perf. `isDesktop === null` (pre-mount) → skip render to avoid
  // hydration flash; reduced-motion → skip entirely.
  const sparkleDensity = isDesktop ? 500 : 180;
  const showSparkles = !shouldReduceMotion && isDesktop !== null;

  return (
    <section
      id="tech-graph"
      aria-labelledby="tech-graph-title"
      className="relative scroll-mt-20 overflow-hidden bg-[#090B14] pb-28 pt-16 text-white sm:py-20 lg:scroll-mt-24 lg:py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_82%_20%,rgba(168,85,247,0.20),transparent_36%),linear-gradient(180deg,rgba(9,11,20,0),rgba(9,11,20,0.95))]" />

      {/* Sparkles backdrop — soft radial mask so it fades toward the edges,
          keeping the eye drawn to the workflow diagram in the center. */}
      {showSparkles && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_65%_at_50%_55%,white_0%,white_45%,transparent_90%)] [-webkit-mask-image:radial-gradient(60%_65%_at_50%_55%,white_0%,white_45%,transparent_90%)]"
        >
          <Sparkles
            density={sparkleDensity}
            size={1.1}
            minSize={0.4}
            speed={1.2}
            opacity={0.85}
            minOpacity={0.05}
            opacitySpeed={2.4}
            color="#E0E7FF"
            className="absolute inset-0 h-full w-full"
          />
        </div>
      )}

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />

      <motion.div
        variants={containerVariants}
        initial={initialState}
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8"
      >
        <motion.div variants={itemVariants} className="mx-auto mb-9 max-w-3xl text-center lg:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
            <Cpu aria-hidden="true" className="size-4" />
            AI workflow map
          </div>
          <h2
            id="tech-graph-title"
            className="mb-4 font-display text-h-1 text-white text-balance"
          >
            {content.title}
          </h2>
          <p className="mx-auto max-w-2xl font-body text-body-lg text-slate-300">
            {content.caption}
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GraphSvg content={content} />
        </motion.div>

        <motion.ol
          variants={containerVariants}
          className="mx-auto flex max-w-md flex-col items-stretch gap-3 lg:hidden"
          aria-label="Workflow AI step-by-step"
        >
          {content.nodes.map((node, index) => (
            <motion.li key={node.id} variants={itemVariants} className="flex flex-col items-center">
              <div className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-4 shadow-[0_18px_46px_rgba(2,6,23,0.25)]">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-cyan-200/20 bg-cyan-200/10">
                  <GraphNodeIcon nodeId={node.id} className="size-6 text-cyan-100" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/75">
                    Step {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-base font-semibold text-white">
                    {node.label}
                  </span>
                  <span className="font-body text-sm leading-snug text-slate-300">
                    {node.sublabel}
                  </span>
                </div>
              </div>
              {index < content.nodes.length - 1 && (
                <ArrowDown
                  aria-hidden="true"
                  className="my-1.5 size-4 text-cyan-200/75"
                  strokeWidth={2.5}
                />
              )}
            </motion.li>
          ))}
        </motion.ol>
      </motion.div>
    </section>
  );
}
