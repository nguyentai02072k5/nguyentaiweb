"use client";

/**
 * scroll-to-top-button.tsx — Floating "back to top" pill.
 *
 * Appears after the user scrolls past 600px. Mobile position sits above the
 * StickyCtaBar (56px) so the two never overlap. Smooth scrolls to page top.
 * Respects prefers-reduced-motion (instant jump, no fade/scale).
 */

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useCallback } from "react";
import { useScrollPast } from "@/hooks/use-scroll-past";

const SHOW_AFTER_PX = 600;

export function ScrollToTopButton() {
  const shouldShow = useScrollPast(SHOW_AFTER_PX);
  const shouldReduceMotion = useReducedMotion();

  const handleClick = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [shouldReduceMotion]);

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label="Cuộn lên đầu trang"
      aria-hidden={!shouldShow}
      tabIndex={shouldShow ? 0 : -1}
      initial={false}
      animate={
        shouldShow
          ? { opacity: 0.8,  scale: 1, y: 0, pointerEvents: "auto" }
          : { opacity: 0, scale: 0.85, y: 12, pointerEvents: "none" }
      }
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="
        fixed z-40
        right-4 bottom-24
        md:right-6 md:bottom-6
        inline-flex items-center justify-center
        size-11 md:size-12
        rounded-full
        bg-aurora bg-[length:200%_200%] animate-aurora motion-reduce:animate-none
        text-text-on-brand
        shadow-glow-violet hover:shadow-glow-pink
        active:scale-[0.94] motion-reduce:active:scale-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2
        transition-shadow
      "
    >
      <ArrowUp className="size-5" strokeWidth={2.4} aria-hidden="true" />
    </motion.button>
  );
}
