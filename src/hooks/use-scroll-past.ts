"use client";

/**
 * use-scroll-past.ts — Boolean hook: has the window scrolled past N pixels?
 *
 * Returns true when `window.scrollY > threshold`. SSR-safe (defaults false).
 * Used by NavBar to toggle transparent → glass background on scroll.
 *
 * Uses passive scroll listener with rAF throttle for smooth perf.
 */

import { useEffect, useState } from 'react';

export function useScrollPast(threshold: number): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      setPast(window.scrollY > threshold);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    // Initial check
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return past;
}
