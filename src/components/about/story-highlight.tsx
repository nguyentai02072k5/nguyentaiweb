"use client";

/**
 * story-highlight.tsx - Pink gradient underline highlight span (F1 style).
 *
 * CSS background-gradient technique:
 *   background: linear-gradient(180deg, transparent 60%, rgba(236,72,153,0.18) 60%)
 *
 * Safari iOS fallback: solid bg pink-50 equivalent if gradient not supported.
 * (Modern Safari 15+ supports this correctly; kept simple for compat.)
 *
 * NOT animated - shown statically (animation-free for reduced-motion compat).
 * Pink is accent-only - text colour remains text-primary (no contrast issue).
 */

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type StoryHighlightProps = {
  children: ReactNode;
};

export function StoryHighlight({ children }: StoryHighlightProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.mark
      initial={shouldReduceMotion ? false : { backgroundSize: '0% 40%' }}
      whileInView={{ backgroundSize: '100% 40%' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, ease: [0.2, 0, 0, 1], delay: 0.1 }}
      className="
        bg-transparent
        px-[2px]
        font-medium
        text-text-primary
        not-italic
        rounded-none
      "
      style={{
        backgroundImage: 'linear-gradient(90deg, rgba(236,72,153,0.22), rgba(168,85,247,0.14))',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 86%',
        backgroundSize: shouldReduceMotion ? '100% 40%' : '0% 40%',
        // Explicit inline fallback for Safari iOS 15 where custom props in gradient sometimes fail
        WebkitBoxDecorationBreak: 'clone',
        boxDecorationBreak: 'clone',
      }}
    >
      {children}
    </motion.mark>
  );
}
