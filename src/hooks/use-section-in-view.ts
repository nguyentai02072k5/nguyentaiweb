"use client";

/**
 * use-section-in-view.ts - IntersectionObserver hook returning a boolean.
 *
 * Returns true while the target element (selected by CSS selector) is at
 * least partially in the viewport, false otherwise. Used by StickyCtaBar
 * to gate visibility on Hero / Booking section boundaries.
 *
 * - SSR-safe: defaults to `false` server-side; updates on mount.
 * - Missing element: stays `false` (treated as "off page"). This lets the
 *   Sticky CTA keep showing when Booking section is added later (Phase 06).
 */

import { useEffect, useState } from 'react';

export function useSectionInView(
  selector: string,
  options?: IntersectionObserverInit,
): boolean {
  const [inView, setInView] = useState(false);
  const root = options?.root ?? null;
  const rootMargin = options?.rootMargin ?? '0px';
  const threshold = options?.threshold ?? 0;
  const thresholdKey = Array.isArray(threshold)
    ? threshold.join(',')
    : String(threshold);

  useEffect(() => {
    const el = document.querySelector(selector);
    if (!el) {
      const frame = requestAnimationFrame(() => setInView(false));
      return () => cancelAnimationFrame(frame);
    }
    const observerThreshold = thresholdKey.includes(',')
      ? thresholdKey.split(',').map(Number)
      : Number(thresholdKey);
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { root, rootMargin, threshold: observerThreshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [selector, root, rootMargin, thresholdKey]);

  return inView;
}
