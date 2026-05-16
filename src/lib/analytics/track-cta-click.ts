/**
 * track-cta-click.ts - CTA click analytics stub.
 *
 * v1: console.log + window.dataLayer push (no UTM).
 * v1.5 target: wire Vercel Analytics / Plausible.
 *
 * Called from all CTA buttons via data-cta-location attribute.
 */

import type { CtaLocation } from '@/content/landing';
import { trackMetaCustomEvent } from '@/lib/analytics/meta-pixel';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackCtaClick(location: CtaLocation): void {
  const event = {
    event: 'cta_click',
    cta_location: location,
    timestamp: new Date().toISOString(),
  };

  // Console log for dev visibility
  if (process.env.NODE_ENV === 'development') {
    console.log('[CTA]', event);
  }

  // GTM dataLayer push - safe guard if not configured
  if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
    window.dataLayer.push(event);
  }

  trackMetaCustomEvent('CtaClick', {
    cta_location: location,
  });
}
