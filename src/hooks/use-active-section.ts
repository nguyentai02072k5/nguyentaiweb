"use client";

/**
 * use-active-section.ts — Returns the currently active section ID via IntersectionObserver.
 *
 * Watches DOM elements matching `#${id}` for each id in sectionIds[].
 * Marks a section active when its center crosses the upper-third of viewport.
 *
 * SSR-safe: returns null server-side. Missing elements skipped gracefully
 * (Phase 04-06 sections not yet built — hook tolerates absence).
 */

import { useEffect, useState } from 'react';

export function useActiveSection(sectionIds: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    // Detection band: upper third of viewport
    const observerOpts: IntersectionObserverInit = {
      rootMargin: '-30% 0% -60% 0%',
      threshold: 0,
    };

    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActive(id);
      }, observerOpts);

      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [sectionIds]);

  return active;
}
